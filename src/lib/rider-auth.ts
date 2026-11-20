/**
 * Rider sign-in by SMS code — the client side of the login flow.
 *
 * !! UI PREVIEW !!  This project has no authentication backend yet, so the two functions below run against a
 * small in-browser stand-in (`preview*` further down): no SMS is sent and nothing is stored. The screen is
 * fully wired to this contract, so going live means replacing ONLY the bodies of `sendCode` and `verifyCode`
 * (and flipping `AUTH_IS_PREVIEW` to false) — no component changes.
 *
 * Integration points (what the real endpoints must provide):
 *
 *   POST /api/auth/otp/send     { phone: "+919876543210" }
 *     200 { codeLength: 6, expiresInSec: 300, resendAfterSec: 30 }
 *     429 { retryAfterSec }                       -> AuthError("rate_limited")
 *     400                                         -> AuthError("invalid_phone")
 *
 *   POST /api/auth/otp/verify   { phone, code }
 *     200 { redirectTo?: "/track" }  + Set-Cookie session (HttpOnly, Secure, SameSite=Lax)
 *     401                                         -> AuthError("invalid")   (wrong code)
 *     410                                         -> AuthError("expired")   (code too old; ask for a new one)
 *     429 { retryAfterSec }                       -> AuthError("rate_limited")
 *
 *   - Code length, expiry and the resend delay come from the SEND response, so the server stays in charge.
 *   - A `fetch` that throws (offline, DNS, CORS, timeout) must become AuthError("network") — the screen keeps what
 *     the rider typed and lets them retry.
 *   - The post-login destination is the `next` query parameter of /login (same-site paths only, see safeNext) or
 *     the `redirectTo` returned by verify; the page only navigates after verify succeeded.
 */

export type OtpConfig = { codeLength: number; expiresInSec: number; resendAfterSec: number };
export type VerifyResult = { redirectTo?: string };

export type AuthErrorKind = "network" | "invalid_phone" | "invalid" | "expired" | "rate_limited" | "server";

export class AuthError extends Error {
  kind: AuthErrorKind;
  retryAfterSec?: number;
  constructor(kind: AuthErrorKind, retryAfterSec?: number) {
    super(kind);
    this.name = "AuthError";
    this.kind = kind;
    this.retryAfterSec = retryAfterSec;
  }
}

/** true while the stand-in below is in use — the login screen shows a "UI preview" notice */
export const AUTH_IS_PREVIEW = true;
/** the code the preview accepts (shown in the preview notice) */
export const PREVIEW_CODE = "123456";

/** Ask the server to text a code to `phone` (E.164, e.g. "+919876543210"). */
export async function sendCode(phone: string): Promise<OtpConfig> {
  return previewSend(phone);
}

/** Check the code the rider typed. Resolves only when the server confirmed it. */
export async function verifyCode(phone: string, code: string): Promise<VerifyResult> {
  return previewVerify(phone, code);
}

/** Same-site paths only ("/track", "/plans/annual?x=1"); anything else (absolute URLs, "//host", "\\") -> "/". */
export function safeNext(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\") || raw.includes("\n") || raw.includes("\r")) return "/";
  return raw;
}

// ---------------------------------------------------------------------------------------------------------------
// Preview stand-in (delete when the real endpoints exist)
// ---------------------------------------------------------------------------------------------------------------

const PREVIEW_CONFIG: OtpConfig = { codeLength: 6, expiresInSec: 300, resendAfterSec: 30 };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const preview = {
  sentAt: 0,
  phone: "",
  wrongTries: 0,
  failNextSend: true, // the number 90000 00000 fails once with a network error, to try the retry path
  failNextVerify: true, // entering 000000 fails once with a network error
};

async function previewSend(phone: string): Promise<OtpConfig> {
  await wait(650);
  if (typeof navigator !== "undefined" && navigator.onLine === false) throw new AuthError("network");
  if (phone.endsWith("9000000000") && preview.failNextSend) {
    preview.failNextSend = false;
    throw new AuthError("network");
  }
  preview.phone = phone;
  preview.sentAt = Date.now();
  preview.wrongTries = 0;
  return PREVIEW_CONFIG;
}

async function previewVerify(phone: string, code: string): Promise<VerifyResult> {
  await wait(700);
  if (typeof navigator !== "undefined" && navigator.onLine === false) throw new AuthError("network");
  if (code === "000000" && preview.failNextVerify) {
    preview.failNextVerify = false;
    throw new AuthError("network");
  }
  if (phone !== preview.phone || !preview.sentAt) throw new AuthError("server");
  if (Date.now() - preview.sentAt > PREVIEW_CONFIG.expiresInSec * 1000) throw new AuthError("expired");
  if (preview.wrongTries >= 5) throw new AuthError("rate_limited", 30);
  if (code !== PREVIEW_CODE) {
    preview.wrongTries += 1;
    throw new AuthError("invalid");
  }
  return {};
}
