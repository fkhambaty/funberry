"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface TimerState {
  isActive: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  isLocked: boolean;
}

interface TimerContextType {
  timer: TimerState;
  startTimer: (minutes: number) => void;
  stopTimer: () => void;
  unlock: (pin: string) => boolean;
  parentPin: string | null;
  setParentPin: (pin: string) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

const defaultTimerContext: TimerContextType = {
  timer: { isActive: false, totalSeconds: 0, remainingSeconds: 0, isLocked: false },
  startTimer: () => {},
  stopTimer: () => {},
  unlock: () => false,
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
  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    isLocked: false,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      });
    },
    [clearTick]
  );

  const stopTimer = useCallback(() => {
    clearTick();
    setTimer({ isActive: false, totalSeconds: 0, remainingSeconds: 0, isLocked: false });
  }, [clearTick]);

  const unlock = useCallback(
    (enteredPin: string): boolean => {
      if (enteredPin === parentPin) {
        clearTick();
        setTimer({ isActive: false, totalSeconds: 0, remainingSeconds: 0, isLocked: false });
        return true;
      }
      return false;
    },
    [parentPin, clearTick]
  );

  useEffect(() => {
    if (!timer.isActive || timer.isLocked) {
      clearTick();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev.remainingSeconds <= 1) {
          return { ...prev, remainingSeconds: 0, isLocked: true };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return clearTick;
  }, [timer.isActive, timer.isLocked, clearTick]);

  return (
    <TimerContext.Provider value={{ timer, startTimer, stopTimer, unlock, parentPin, setParentPin }}>
      {children}
    </TimerContext.Provider>
  );
}
