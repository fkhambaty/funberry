"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface TimerState {
  isActive: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  isLocked: boolean;
  isPaused: boolean;
  /** After PIN is verified, show the extend/stop decision screen */
  awaitingDecision: boolean;
}

interface TimerContextType {
  timer: TimerState;
  startTimer: (minutes: number) => void;
  stopTimer: () => void;
  /** Verify PIN — if correct, move to decision screen (extend or stop) */
  verifyPin: (pin: string) => boolean;
  /** Parent chose to extend: start a fresh timer, game resumes */
  extendTimer: (minutes: number) => void;
  /** Parent chose to stop: end session entirely */
  endSession: () => void;
  parentPin: string | null;
  setParentPin: (pin: string) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

const defaultTimerContext: TimerContextType = {
  timer: {
    isActive: false, totalSeconds: 0, remainingSeconds: 0,
    isLocked: false, isPaused: false, awaitingDecision: false,
  },
  startTimer: () => {},
  stopTimer: () => {},
  verifyPin: () => false,
  extendTimer: () => {},
  endSession: () => {},
  parentPin: null,
  setParentPin: () => {},
};

export function useTimer() {
  const ctx = useContext(TimerContext);
  return ctx ?? defaultTimerContext;
}

export function TimerProvider({
  children,
  pin: initialPin,
}: {
  children: React.ReactNode;
  pin: string | null;
}) {
  const [parentPin, setParentPin] = useState(initialPin);

  useEffect(() => {
    if (initialPin !== null) setParentPin(initialPin);
  }, [initialPin]);

  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    isLocked: false,
    isPaused: false,
    awaitingDecision: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);

  activeRef.current = timer.isActive && !timer.isLocked && !timer.isPaused;

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (minutes: number) => {
      clearTick();
      const totalSec = minutes * 60;
      setTimer({
        isActive: true,
        totalSeconds: totalSec,
        remainingSeconds: totalSec,
        isLocked: false,
        isPaused: false,
        awaitingDecision: false,
      });
    },
    [clearTick]
  );

  const stopTimer = useCallback(() => {
    clearTick();
    setTimer({
      isActive: false, totalSeconds: 0, remainingSeconds: 0,
      isLocked: false, isPaused: false, awaitingDecision: false,
    });
  }, [clearTick]);

  const verifyPin = useCallback(
    (enteredPin: string): boolean => {
      if (enteredPin === parentPin) {
        setTimer((prev) => ({
          ...prev,
          isLocked: false,
          awaitingDecision: true,
          isPaused: true,
        }));
        return true;
      }
      return false;
    },
    [parentPin]
  );

  const extendTimer = useCallback(
    (minutes: number) => {
      clearTick();
      const totalSec = minutes * 60;
      setTimer({
        isActive: true,
        totalSeconds: totalSec,
        remainingSeconds: totalSec,
        isLocked: false,
        isPaused: false,
        awaitingDecision: false,
      });
    },
    [clearTick]
  );

  const endSession = useCallback(() => {
    clearTick();
    setTimer({
      isActive: false, totalSeconds: 0, remainingSeconds: 0,
      isLocked: false, isPaused: false, awaitingDecision: false,
    });
  }, [clearTick]);

  useEffect(() => {
    if (!timer.isActive || timer.isLocked || timer.isPaused) {
      clearTick();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!activeRef.current) return;

      setTimer((prev) => {
        if (prev.remainingSeconds <= 1) {
          return {
            ...prev,
            remainingSeconds: 0,
            isLocked: true,
            isActive: false,
            isPaused: true,
          };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return clearTick;
  }, [timer.isActive, timer.isLocked, timer.isPaused, clearTick]);

  return (
    <TimerContext.Provider value={{
      timer, startTimer, stopTimer, verifyPin,
      extendTimer, endSession, parentPin, setParentPin,
    }}>
      {children}
    </TimerContext.Provider>
  );
}
