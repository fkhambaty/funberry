export const FUNBERRY_API =
  process.env.NEXT_PUBLIC_FUNBERRY_API ||
  process.env.EXPO_PUBLIC_FUNBERRY_API ||
  "https://funberry-api.fkhambaty.workers.dev";

const STORAGE_KEY = "funberry_session";

export type AccountUser = { id: string; email: string };

export type AccountSession = {
  access_token: string;
  user: AccountUser;
};

type Listener = (event: string, session: AccountSession | null) => void;

type SessionStore = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

const memory = new Map<string, string>();

const browserStore: SessionStore = {
  async getItem(key) {
    if (typeof localStorage !== "undefined") {
      try {
        return localStorage.getItem(key);
      } catch {
        return memory.get(key) ?? null;
      }
    }
    return memory.get(key) ?? null;
  },
  async setItem(key, value) {
    memory.set(key, value);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(key, value);
      } catch {
        // In-memory copy still covers this page load.
      }
    }
  },
  async removeItem(key) {
    memory.delete(key);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore restricted storage.
      }
    }
  },
};

let store: SessionStore = browserStore;
const listeners = new Set<Listener>();

/** Mobile passes SecureStore. The website uses localStorage. */
export function setSessionStore(next: SessionStore) {
  store = next;
}

async function readSession(): Promise<AccountSession | null> {
  const raw = await store.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AccountSession;
    if (!parsed?.access_token || !parsed.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeSession(session: AccountSession | null, event: string) {
  if (session) await store.setItem(STORAGE_KEY, JSON.stringify(session));
  else await store.removeItem(STORAGE_KEY);
  for (const listener of listeners) listener(event, session);
}

function messageFrom(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") return body.error;
  return fallback;
}

export async function accountRequest<T>(
  path: string,
  init?: { method?: string; body?: unknown; auth?: boolean },
): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (init?.auth !== false) {
    const session = await readSession();
    if (session?.access_token) headers.authorization = `Bearer ${session.access_token}`;
  }
  let response: Response;
  try {
    response = await fetch(`${FUNBERRY_API}${path}`, {
      method: init?.method ?? "GET",
      headers,
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new Error("FunBerry could not reach the account service. Try again in a moment.");
  }
  const body = await response.json().catch(() => null);
  if (response.status === 401 && init?.auth !== false && path !== "/v1/login") {
    await writeSession(null, "SIGNED_OUT");
  }
  if (!response.ok) {
    const error = new Error(messageFrom(body, "The database did not accept that request.")) as AccountError;
    if (body && typeof body === "object" && "needs_verification" in body && body.needs_verification) {
      error.needsVerification = true;
      error.email = "email" in body && typeof body.email === "string" ? body.email : undefined;
    }
    throw error;
  }
  return body as T;
}

export type AccountError = Error & { needsVerification?: boolean; email?: string };

type AuthPayload = {
  user: AccountUser;
  session: AccountSession;
};

async function storeAuth(payload: AuthPayload, event: string) {
  await writeSession(payload.session, event);
  return payload;
}

/** Creates the account and emails a 6-digit code. No session until the code is confirmed. */
export async function accountSignUp(email: string, password: string, name: string, pin?: string) {
  await accountRequest("/v1/signup", {
    method: "POST",
    auth: false,
    body: { email, password, name, pin },
  });
  return { user: null, session: null, needsVerification: true as const };
}

export async function accountVerify(email: string, code: string) {
  const payload = await accountRequest<AuthPayload>("/v1/verify", {
    method: "POST",
    auth: false,
    body: { email, code },
  });
  return storeAuth(payload, "SIGNED_IN");
}

export async function accountResendCode(email: string) {
  await accountRequest("/v1/resend-code", { method: "POST", auth: false, body: { email } });
}

export async function accountForgotPassword(email: string) {
  await accountRequest("/v1/forgot-password", { method: "POST", auth: false, body: { email } });
}

export async function accountResetPassword(email: string, code: string, password: string) {
  await accountRequest("/v1/reset-password", { method: "POST", auth: false, body: { email, code, password } });
}

export async function accountSignIn(email: string, password: string) {
  const payload = await accountRequest<AuthPayload>("/v1/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  return storeAuth(payload, "SIGNED_IN");
}

export async function accountSignOut() {
  try {
    await accountRequest("/v1/logout", { method: "POST" });
  } catch {
    // Local sign-out still counts if the server is briefly unreachable.
  }
  await writeSession(null, "SIGNED_OUT");
}

export async function accountUser(): Promise<AccountUser | null> {
  const session = await readSession();
  return session?.user ?? null;
}

export const accountAuth = {
  async getSession() {
    return { data: { session: await readSession() }, error: null };
  },
  async getUser() {
    const session = await readSession();
    return { data: { user: session?.user ?? null }, error: null };
  },
  onAuthStateChange(callback: Listener) {
    listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe() {
            listeners.delete(callback);
          },
        },
      },
    };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const data = await accountSignIn(email, password);
      return { data, error: null };
    } catch (err) {
      return { data: { user: null, session: null }, error: err instanceof Error ? err : { message: "Invalid login credentials" } };
    }
  },
  async signOut() {
    await accountSignOut();
    return { error: null };
  },
  async updateUser({ password }: { password: string }) {
    try {
      await accountRequest("/v1/password", { method: "POST", body: { password } });
      return { data: { user: await accountUser() }, error: null };
    } catch (err) {
      return { data: { user: null }, error: err instanceof Error ? err : { message: "Could not change the password." } };
    }
  },
  async exchangeCodeForSession() {
    return {
      data: { session: null },
      error: { message: "Email confirmation is no longer used. Sign in with your password." },
    };
  },
  async setSession() {
    return {
      data: { session: null },
      error: { message: "Email confirmation is no longer used. Sign in with your password." },
    };
  },
};
