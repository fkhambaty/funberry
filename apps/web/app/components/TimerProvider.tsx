"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface TimerState {
  isActive: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  isLocked: boolean;
  isPaused: boolean;
  awaitingDecision: boolean;
}

interface TimerContextType {
  timer: TimerState;
  startTimer: (minutes: number) => void;
  stopTimer: () => void;
  verifyPin: (pin: string) => boolean;
  extendTimer: (minutes: number) => void;
  endSession: () => void;
  parentPin: string | null;
  setParentPin: (pin: string) => void;
}

const STORAGE_KEY = "funberrykids_timer";

const defaultTimer: TimerState = {
  isActive: false,
  totalSeconds: 0,
  remainingSeconds: 0,
  isLocked: false,
  isPaused: false,
  awaitingDecision: false,
};

const TimerContext = createContext<TimerContextType | null>(null);

const defaultTimerContext: TimerContextType = {
  timer: defaultTimer,
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

function saveToStorage(state: TimerState) {
  try {
    const payload = { ...state, savedAt: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch { /* SSR or private browsing */ }
}

function loadFromStorage(): TimerState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.isActive && !parsed.isLocked && !parsed.awaitingDecision) return null;

    const elapsed = Math.floor((Date.now() - (parsed.savedAt ?? Date.now())) / 1000);

    if (parsed.isActive && !parsed.isLocked && !parsed.isPaused) {
      const adjusted = parsed.remainingSeconds - elapsed;
      if (adjusted <= 0) {
        return {
          ...parsed,
          remainingSeconds: 0,
          isActive: false,
          isLocked: true,
          isPaused: true,
          awaitingDecision: false,
        };
      }
      return { ...parsed, remainingSeconds: adjusted };
    }

    return parsed;
  } catch {
    return null;
  }
}

function clearStorage() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
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

  const [timer, setTimer] = useState<TimerState>(() => {
    if (typeof window === "undefined") return defaultTimer;
    return loadFromStorage() ?? defaultTimer;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef(timer);
  timerRef.current = timer;

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    saveToStorage(timer);
  }, [timer]);

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
    clearStorage();
    setTimer(defaultTimer);
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
    clearStorage();
    setTimer(defaultTimer);
  }, [clearTick]);

  useEffect(() => {
    if (!timer.isActive || timer.isLocked || timer.isPaused) {
      clearTick();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (!prev.isActive || prev.isLocked || prev.isPaused) return prev;
        if (prev.remainingSeconds <= 1) {
          return {
            ...prev,
            remainingSeconds: 0,
            isActive: false,
            isLocked: true,
            isPaused: true,
            awaitingDecision: false,
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
