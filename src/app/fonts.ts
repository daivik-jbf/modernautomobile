import { Anton, Barlow, Barlow_Condensed } from "next/font/google";

/** Site fonts — shared by the root layout and global-error (which renders its own <html>). */
export const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const fontVariables = `${barlow.variable} ${barlowCondensed.variable} ${anton.variable}`;
