"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BIKE_CATALOG, BRANCHES, BRANDS } from "@/lib/catalog";
import { ArrowRight } from "./icons";
import { SelectField } from "./select-field";

export function BookingForm() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const missing = [
    !location && "location",
    !brand && "brand",
    !model && "model",
  ].filter(Boolean) as string[];
  const showError = submitted && missing.length > 0;

  function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (missing.length > 0) return;
    const params = new URLSearchParams({ location, brand, model });
    router.push(`/book?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Book a service" className="space-y-2 sm:space-y-2.5">
      <SelectField
        label="Location"
        placeholder="Select location"
        value={location}
        onChange={setLocation}
        options={BRANCHES.map((b) => ({ value: b.id, label: b.name }))}
        invalid={submitted && !location}
        describedBy="booking-error"
      />

      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:gap-2.5">
        <SelectField
          label="Brand"
          placeholder="Select brand"
          value={brand}
          onChange={(v) => {
            setBrand(v);
            setModel(""); // models depend on the brand
          }}
          options={BRANDS.map((b) => ({ value: b, label: b }))}
          invalid={submitted && !brand}
          describedBy="booking-error"
        />
        <SelectField
          label="Model"
          placeholder={brand ? "Select model" : "Select brand first"}
          compactPlaceholder="Select model"
          value={model}
          onChange={setModel}
          options={(BIKE_CATALOG[brand] ?? []).map((m) => ({ value: m, label: m }))}
          disabled={!brand}
          invalid={submitted && !!brand && !model}
          describedBy="booking-error"
        />
      </div>

      <button
        type="submit"
        className="group relative flex h-11 w-full sm:h-12 items-center justify-center gap-3 overflow-hidden rounded-lg bg-brand font-condensed text-[17px] font-semibold uppercase tracking-wide text-white shadow-[0_10px_24px_-10px_rgba(216,25,31,0.8)] transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-[0_14px_28px_-10px_rgba(216,25,31,0.95)] active:translate-y-0 active:scale-[0.99]"
      >
        {/* light sweep on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-[20deg] bg-white/25 opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[520%] group-hover:opacity-100"
        />
        <span className="relative">Book a service</span>
        <ArrowRight className="relative size-5 transition-transform duration-200 group-hover:translate-x-1.5" />
      </button>

      <p
        id="booking-error"
        role="alert"
        className="min-h-4 text-sm text-[#ff8a8e] sm:min-h-5"
      >
        {showError && (
          <span className="animate-fade-up inline-block">
            Please select your {missing.join(", ")}.
          </span>
        )}
      </p>
    </form>
  );
}
