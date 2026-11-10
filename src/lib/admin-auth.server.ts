// Server-only admin authentication.
// Credentials are NOT in the code: they come from Netlify environment variables
//   ADMIN_USER, ADMIN_PASSWORD, ADMIN_SESSION_SECRET (>= 32 random characters)
// If any is missing the login is simply disabled.
import {
  deleteCookie,
  getCookie,
  getRequest,
  getRequestHeader,
  getRequestIP,
  setCookie,
} from "@tanstack/react-start/server";

const COOKIE = "hl_admin";
const SESSION_SECONDS = 60 * 60 * 12; // 12 hours

type Config = { user: string; password: string; secret: string };

function getConfig(): Config | null {
  const user = process.env.ADMIN_USER ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!user || !password || secret.length < 32) return null;
  return { user, password, secret };
}

export const isAdminConfigured = () => getConfig() !== null;

// ---------- crypto helpers ----------

const enc = new TextEncoder();

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

function toB64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Both sides are hashed first, so the comparison time does not depend on the input.
async function credentialsMatch(cfg: Config, user: string, password: string): Promise<boolean> {
  const [u1, u2, p1, p2] = await Promise.all([
    hmac(cfg.secret, `u:${user}`),
    hmac(cfg.secret, `u:${cfg.user}`),
    hmac(cfg.secret, `p:${password}`),
    hmac(cfg.secret, `p:${cfg.password}`),
  ]);
  const userOk = equalBytes(u1, u2);
  const passOk = equalBytes(p1, p2);
  return userOk && passOk;
}

// The token ties the expiry to the current password, so changing the password
// (or the secret) logs everybody out.
async function sign(cfg: Config, exp: number): Promise<string> {
  const pw = toB64Url(await hmac(cfg.secret, `p:${cfg.password}`));
  return toB64Url(await hmac(cfg.secret, `session:${exp}:${pw}`));
}

async function makeToken(cfg: Config): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `${exp}.${await sign(cfg, exp)}`;
}

async function tokenValid(cfg: Config, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expRaw, sig] = token.split(".");
  const exp = Number(expRaw);
  if (!sig || !Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await sign(cfg, exp);
  return equalBytes(enc.encode(sig), enc.encode(expected));
}

// ---------- rate limiting (per server instance, best effort) ----------

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; first: number }>();

function clientKey(): string {
  return (
    getRequestHeader("x-nf-client-connection-ip") ??
    getRequestIP({ xForwardedFor: true }) ??
    "unknown"
  );
}

function isBlocked(key: string): boolean {
  const rec = fails.get(key);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    fails.delete(key);
    return false;
  }
  return rec.count >= MAX_FAILS;
}

function recordFail(key: string) {
  const rec = fails.get(key);
  if (!rec || Date.now() - rec.first > WINDOW_MS) fails.set(key, { count: 1, first: Date.now() });
  else rec.count++;
  if (fails.size > 500) fails.clear();
}

// ---------- cookie flags ----------

// A "Secure" cookie is silently dropped by browsers when it is set over plain
// http, which made the login bounce back to the form. So the flag follows the
// real connection: Secure unless the request is explicitly plain http.
function isPlainHttp(): boolean {
  const forwarded = getRequestHeader("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (forwarded) return forwarded === "http";
  try {
    return new URL(getRequest().url).protocol === "http:";
  } catch {
    return false;
  }
}

// ---------- public API used by the server functions ----------

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(user: unknown, password: unknown): Promise<LoginResult> {
  const cfg = getConfig();
  if (!cfg) {
    return {
      ok: false,
      error: "A belépés nincs beállítva (ADMIN_USER, ADMIN_PASSWORD, ADMIN_SESSION_SECRET).",
    };
  }
  const key = clientKey();
  if (isBlocked(key)) {
    return { ok: false, error: "Túl sok sikertelen próbálkozás. Próbáld újra 15 perc múlva." };
  }
  const u = typeof user === "string" ? user.slice(0, 200) : "";
  const p = typeof password === "string" ? password.slice(0, 500) : "";

  if (!(await credentialsMatch(cfg, u, p))) {
    recordFail(key);
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "Hibás felhasználónév vagy jelszó." };
  }

  fails.delete(key);
  setCookie(COOKIE, await makeToken(cfg), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !isPlainHttp(),
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return { ok: true };
}

export function logout() {
  deleteCookie(COOKIE, { path: "/" });
}

export async function isAdmin(): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg) return false;
  return tokenValid(cfg, getCookie(COOKIE));
}
