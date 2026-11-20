"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import { AUTH_IS_PREVIEW, AuthError, PREVIEW_CODE, safeNext, sendCode, verifyCode } from "@/lib/rider-auth";
import type { OtpConfig } from "@/lib/rider-auth";
import { TOOLBOX_FRONT, TOOLBOX_STAGE, TOOLBOX_TRAY } from "@/lib/toolbox";

type Step = "phone" | "code" | "success";

const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const OPEN_MS = 520; // drawer travel (400ms) + the form's fade-in starts; focus moves here
const SUCCESS_MS = 1200; // how long "Signed in" shows before continuing

function messageFor(err: unknown): string {
  const e = err instanceof AuthError ? err : null;
  switch (e?.kind) {
    case "network":
      return "Can't reach the server. What you typed is saved — check your connection and try again.";
    case "invalid_phone":
      return "That mobile number doesn't look right. Check it and try again.";
    case "invalid":
      return "That code isn't right. Check the SMS and try again.";
    case "expired":
      return "That code has expired. Request a new one below.";
    case "rate_limited":
      return `Too many attempts. Try again in ${e.retryAfterSec ?? 30} seconds.`;
    default:
      return "Something went wrong on our side. Please try again.";
  }
}

/**
 * Rider login: one real workshop drawer.
 *
 * Layers (all separate elements, stage-space coordinates in globals.css `.tb-*`; the camera never moves):
 *   .tb-world   the cabinet photo (stays put the whole time)
 *   .tb-tray    the recessed tray (revealed from its top edge) + the live HTML form on top of it
 *   .tb-front   the closed drawer front — ONE button; its handle and body are separate pieces
 * Opening: the handle gives a little, then the front slides toward the rider (it squashes into the tray's own
 * front panel, perspective-style) while the tray grows out from its top edge; ~400ms ease-out, no bounce.
 * Then the form fades in. Everything else is HTML: label, fields, buttons. No screenshots are cross-faded.
 *
 * Auth: lib/rider-auth.ts. Today that is a clearly-labelled UI preview (no backend in this project).
 */
export function ToolboxLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const destination = safeNext(params.get("next"));

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(""); // 10 digits, no country code
  const [code, setCode] = useState("");
  const [cfg, setCfg] = useState<OtpConfig | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const lock = useRef(false); // repeated taps must not restart the animation
  const frontRef = useRef<HTMLButtonElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const successTimer = useRef(0);

  const e164 = `+91${phone}`;
  const codeLength = cfg?.codeLength ?? 6;
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  // ----- open / close -----
  const openDrawer = () => {
    if (lock.current || open) return;
    lock.current = true;
    setOpen(true);
    window.setTimeout(() => (step === "code" ? codeRef.current : phoneRef.current)?.focus(), prefersReduced() ? 0 : OPEN_MS);
  };
  const closeDrawer = useCallback(() => {
    lock.current = false;
    window.clearTimeout(successTimer.current);
    setOpen(false);
    setBusy(false);
    setError(null);
    setNotice(null);
    if (step === "success") setStep("phone");
    requestAnimationFrame(() => frontRef.current?.focus());
  }, [step]);

  const onStageKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      closeDrawer();
    }
  };

  // move focus to the field that matches the step (after "Send code" / "Change number")
  useEffect(() => {
    if (!open) return;
    if (step === "code") codeRef.current?.focus();
    if (step === "phone") phoneRef.current?.focus();
  }, [step, open]);

  // countdown for "Resend code"
  useEffect(() => {
    if (step !== "code") return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [step]);

  useEffect(() => () => window.clearTimeout(successTimer.current), []);

  // mobile keyboard: keep the field AND its button reachable when the on-screen keyboard appears
  useEffect(() => {
    if (!open) return;
    const reveal = () => {
      const el = bodyRef.current;
      if (!el || !el.contains(document.activeElement)) return;
      // only move the page when the form is (partly) hidden — e.g. under the on-screen keyboard
      const r = el.getBoundingClientRect();
      const vh = window.visualViewport?.height ?? window.innerHeight;
      if (r.top >= 56 && r.bottom <= vh - 8) return;
      el.scrollIntoView({ block: "center", behavior: prefersReduced() ? "auto" : "smooth" });
    };
    const vv = window.visualViewport;
    vv?.addEventListener("resize", reveal);
    document.addEventListener("focusin", reveal);
    return () => {
      vv?.removeEventListener("resize", reveal);
      document.removeEventListener("focusin", reveal);
    };
  }, [open]);

  // ----- actions -----
  async function requestCode(isResend: boolean) {
    if (busy) return;
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      phoneRef.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const c = await sendCode(e164);
      const t = Date.now();
      setCfg(c);
      setNow(t);
      setResendAt(t + c.resendAfterSec * 1000);
      setCode("");
      if (isResend) setNotice("A new code is on its way.");
      setStep("code");
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(value: string) {
    if (busy) return;
    if (value.length !== codeLength) {
      setError(`Enter the ${codeLength}-digit code from the SMS.`);
      codeRef.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await verifyCode(e164, value);
      setStep("success");
      const to = safeNext(res.redirectTo ?? destination);
      successTimer.current = window.setTimeout(() => router.replace(to), prefersReduced() ? 500 : SUCCESS_MS);
    } catch (err) {
      setError(messageFor(err));
      if (err instanceof AuthError && (err.kind === "invalid" || err.kind === "expired")) codeRef.current?.select();
    } finally {
      setBusy(false);
    }
  }

  const onPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let d = e.target.value.replace(/\D/g, "");
    if (d.length > 10 && d.startsWith("91")) d = d.slice(2); // pasted "+91 98765 43210"
    if (d.length > 10 && d.startsWith("0")) d = d.slice(1);
    setPhone(d.slice(0, 10));
    if (error) setError(null);
  };

  const onCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, codeLength);
    // a paste or the phone's SMS autofill fills (or replaces) the whole code in one go; typing changes it by one digit
    const jumped = next !== code && (next.length - code.length > 1 || next.length === code.length);
    setCode(next);
    if (error) setError(null);
    if (jumped && next.length === codeLength) void submitCode(next);
  };
  const onCodePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, codeLength);
    if (!text) return;
    e.preventDefault();
    setCode(text);
    if (error) setError(null);
    if (text.length === codeLength) void submitCode(text);
  };

  const masked = `+91 ${"•".repeat(6)}${phone.slice(-4)}`;

  return (
    <div className="tb-stage" data-open={open} onKeyDown={onStageKeyDown}>
      {/* the workshop + cabinet: never swapped, never moved */}
      <div className="tb-world" aria-hidden="true">
        <div className="tb-art">
          <Image src={TOOLBOX_STAGE.src} alt="" width={TOOLBOX_STAGE.width} height={TOOLBOX_STAGE.height} unoptimized loading="eager" fetchPriority="high" className="size-full select-none" draggable={false} />
        </div>
      </div>

      <div className="tb-contact" aria-hidden="true" />

      {/* the recessed tray + the live form */}
      <div className="tb-tray" inert={!open} aria-hidden={!open}>
        <div className="tb-tray-bg" aria-hidden="true" style={{ borderImageSource: `url(${TOOLBOX_TRAY.src})` }} />
        <div className="tb-tray-body" ref={bodyRef}>
          {step !== "success" && (
            <button type="button" className="tb-close" onClick={closeDrawer} aria-label="Close the toolbox">
              Close
              <svg viewBox="0 0 24 24" className="size-[1em]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}

          <div className="tb-swap" key={step}>
            {step === "phone" && (
              <form className="tb-form" onSubmit={(e: FormEvent) => { e.preventDefault(); void requestCode(false); }} noValidate aria-labelledby="tb-title">
                <h2 id="tb-title" className="tb-title">Enter your mobile number</h2>
                <label htmlFor="tb-phone" className="tb-lbl">Mobile number</label>
                <div className="tb-field" data-invalid={error ? "true" : undefined}>
                  <span className="tb-cc"><span className="sr-only">Country code </span>+91</span>
                  <input
                    id="tb-phone"
                    ref={phoneRef}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={onPhoneChange}
                    aria-invalid={error ? true : undefined}
                    aria-describedby="tb-msg"
                    disabled={busy}
                    className="tb-input"
                  />
                </div>
                <Msg error={error} notice={notice} />
                <button type="submit" className="tb-btn" disabled={busy}>
                  {busy ? <Spinner label="Sending" /> : "Send code"}
                </button>
              </form>
            )}

            {step === "code" && (
              <form className="tb-form" onSubmit={(e: FormEvent) => { e.preventDefault(); void submitCode(code); }} noValidate aria-labelledby="tb-title">
                <h2 id="tb-title" className="tb-title">Verify your number</h2>
                <p className="tb-sub">
                  We sent a {codeLength}-digit code to <strong>{masked}</strong>
                </p>
                <label htmlFor="tb-code" className="tb-lbl">Verification code</label>
                <div className="tb-field" data-invalid={error ? "true" : undefined}>
                  <input
                    id="tb-code"
                    ref={codeRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    placeholder={"•".repeat(codeLength)}
                    maxLength={codeLength + 2}
                    value={code}
                    onChange={onCodeChange}
                    onPaste={onCodePaste}
                    aria-invalid={error ? true : undefined}
                    aria-describedby="tb-msg"
                    disabled={busy}
                    className="tb-input tb-code"
                  />
                </div>
                <Msg error={error} notice={notice} />
                <button type="submit" className="tb-btn" disabled={busy}>
                  {busy ? <Spinner label="Verifying" /> : "Verify"}
                </button>
                <div className="tb-links">
                  <button type="button" className="tb-link" disabled={busy} onClick={() => { setStep("phone"); setError(null); setNotice(null); }}>
                    Change number
                  </button>
                  <button type="button" className="tb-link" disabled={busy || resendIn > 0} onClick={() => void requestCode(true)}>
                    {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="tb-done" role="status">
                <svg viewBox="0 0 52 52" className="tb-tick" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="26" cy="26" r="23" className="tb-tick-ring" />
                  <path d="M15 27l8 8 14-16" className="tb-tick-check" />
                </svg>
                <p className="tb-title">Signed in</p>
                <p className="tb-sub">Taking you to your destination…</p>
              </div>
            )}
          </div>

          {AUTH_IS_PREVIEW && step !== "success" && (
            <p className="tb-preview">
              UI preview · no SMS is sent · code <b>{PREVIEW_CODE}</b>
            </p>
          )}
        </div>
      </div>

      {/* the closed drawer front: ONE button (click, tap, Enter, Space). Handle and body are separate pieces. */}
      <button
        ref={frontRef}
        type="button"
        className="tb-front"
        onClick={openDrawer}
        aria-expanded={open}
        aria-label="Open toolbox to sign in"
        tabIndex={open ? -1 : 0}
      >
        <span className="tb-front-body" aria-hidden="true">
          <Image src={TOOLBOX_FRONT.src} alt="" width={TOOLBOX_FRONT.width} height={TOOLBOX_FRONT.height} unoptimized loading="eager" fetchPriority="high" className="size-full select-none" draggable={false} />
        </span>
        <span className="tb-handle" aria-hidden="true">
          <Image src={TOOLBOX_FRONT.src} alt="" width={TOOLBOX_FRONT.width} height={TOOLBOX_FRONT.height} unoptimized loading="eager" className="tb-handle-img select-none" draggable={false} />
          <span className="tb-plate">
            Open toolbox to sign in
            <svg viewBox="0 0 24 24" className="tb-plate-arrow" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
}

function Msg({ error, notice }: { error: string | null; notice: string | null }) {
  return (
    <div id="tb-msg" className="tb-msg" aria-live="polite">
      {error ? <p role="alert" className="tb-error">{error}</p> : notice ? <p className="tb-notice">{notice}</p> : null}
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <span className="tb-busy">
      <span className="tb-spin" aria-hidden="true" />
      {label}…
    </span>
  );
}
