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

const LEGACY_STORAGE_KEY = "funberrykids_timer";

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

function saveToStorage(state: TimerState, storageKey: string) {
  try {
    const payload = { ...state, savedAt: Date.now() };
    sessionStorage.setItem(storageKey, JSON.stringify(payload));
  } catch { /* SSR or private browsing */ }
}

function parseTimer(raw: string | null): TimerState | null {
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
}

function loadFromStorage(storageKey: string): TimerState | null {
  try {
    const scoped = parseTimer(sessionStorage.getItem(storageKey));
    if (scoped) return scoped;
    // One-time fallback for pre-scoped timer state.
    return parseTimer(sessionStorage.getItem(LEGACY_STORAGE_KEY));
  } catch {
    return null;
  }
}

function clearStorage(storageKey: string) {
  try {
    sessionStorage.removeItem(storageKey);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function TimerProvider({
  children,
  pin: initialPin,
  storageKey,
  enabled,
}: {
  children: React.ReactNode;
  pin: string | null;
  storageKey: string;
  enabled: boolean;
}) {
  const [parentPin, setParentPin] = useState(initialPin);

  useEffect(() => {
    setParentPin(initialPin);
  }, [initialPin]);

  const [timer, setTimer] = useState<TimerState>(() => {
    return defaultTimer;
  });
  const [hydrated, setHydrated] = useState(false);

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
    if (!enabled || !hydrated || typeof window === "undefined") return;
    saveToStorage(timer, storageKey);
  }, [timer, storageKey, enabled, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHydrated(false);
    if (!enabled) {
      clearTick();
      clearStorage(storageKey);
      setTimer(defaultTimer);
      setHydrated(true);
      return;
    }
    setTimer(loadFromStorage(storageKey) ?? defaultTimer);
    setHydrated(true);
  }, [storageKey, enabled, clearTick]);

  const startTimer = useCallback(
    (minutes: number) => {
      if (!enabled) return;
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
    [clearTick, enabled]
  );

  const stopTimer = useCallback(() => {
    clearTick();
    clearStorage(storageKey);
    setTimer(defaultTimer);
  }, [clearTick, storageKey]);

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
      if (!enabled) return;
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
    [clearTick, enabled]
  );

  const endSession = useCallback(() => {
    clearTick();
    clearStorage(storageKey);
    setTimer(defaultTimer);
  }, [clearTick, storageKey]);

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
