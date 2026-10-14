import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  accountRequest,
  getChildren,
  getParent,
  signIn as workerSignIn,
  signOut as workerSignOut,
  supabase,
  type AccountSession,
  type Child,
  type Parent,
} from "@funberry/supabase";
import { statusOf } from "./api";
import { readMode, writeMode, type AppMode } from "./mode";
import { installSecureSessionStore } from "./secureStore";

export type SessionStatus = "loading" | "signedOut" | "signedIn";

type SessionValue = {
  status: SessionStatus;
  session: AccountSession | null;
  parent: Parent | null;
  childList: Child[];
  mode: AppMode;
  /** True when the saved session exists but the account service could not be reached. */
  unreachable: boolean;
  refresh: () => Promise<void>;
  signIn: (login: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterChildMode: (childId: string) => Promise<void>;
  /** Only the parent gate calls this, after the Worker accepts the PIN. */
  leaveChildMode: () => Promise<void>;
  setChildList: (next: Child[]) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<AccountSession | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [childList, setChildList] = useState<Child[]>([]);
  const [mode, setMode] = useState<AppMode>({ kind: "parent" });
  const [unreachable, setUnreachable] = useState(false);
  const mounted = useRef(true);

  const clear = useCallback(async () => {
    await writeMode({ kind: "parent" });
    if (!mounted.current) return;
    setSession(null);
    setParent(null);
    setChildList([]);
    setMode({ kind: "parent" });
    setUnreachable(false);
    setStatus("signedOut");
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [nextParent, nextChildren] = await Promise.all([getParent(), getChildren()]);
      if (!mounted.current) return;
      setParent(nextParent);
      setChildList(nextChildren);
      setUnreachable(false);
    } catch (error) {
      if (statusOf(error) === 401) return;
      if (mounted.current) setUnreachable(true);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    installSecureSessionStore();
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "SIGNED_OUT" || !next) {
        void clear();
        return;
      }
      setSession(next);
      setStatus("signedIn");
      void refresh();
    });

    void (async () => {
      const [{ data: stored }, savedMode] = await Promise.all([supabase.auth.getSession(), readMode()]);
      if (!stored.session) {
        await clear();
        return;
      }
      try {
        await accountRequest("/v1/session");
      } catch (error) {
        if (statusOf(error) === 401) return;
        if (mounted.current) setUnreachable(true);
      }
      if (!mounted.current) return;
      setSession(stored.session);
      setMode(savedMode);
      setStatus("signedIn");
      await refresh();
    })();

    return () => {
      mounted.current = false;
      data.subscription.unsubscribe();
    };
  }, [clear, refresh]);

  const signIn = useCallback(async (login: string, password: string) => {
    await writeMode({ kind: "parent" });
    setMode({ kind: "parent" });
    await workerSignIn(login.trim(), password);
  }, []);

  const signOut = useCallback(async () => {
    await workerSignOut();
    await clear();
  }, [clear]);

  const enterChildMode = useCallback(async (childId: string) => {
    const next: AppMode = { kind: "child", childId };
    await writeMode(next);
    setMode(next);
  }, []);

  const leaveChildMode = useCallback(async () => {
    await writeMode({ kind: "parent" });
    setMode({ kind: "parent" });
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      status,
      session,
      parent,
      childList,
      mode,
      unreachable,
      refresh,
      signIn,
      signOut,
      enterChildMode,
      leaveChildMode,
      setChildList,
    }),
    [status, session, parent, childList, mode, unreachable, refresh, signIn, signOut, enterChildMode, leaveChildMode],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}

/** The child currently in child mode, if that child still exists on the account. */
export function useActiveChild(): Child | null {
  const { mode, childList } = useSession();
  if (mode.kind !== "child") return null;
  return childList.find((child) => child.id === mode.childId) ?? null;
}
