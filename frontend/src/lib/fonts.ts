import { Fraunces, Inter } from "next/font/google";

// Serif display font for headings — editorial, professional "legal" feel.
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// Sans body/UI font — clean, highly legible, good tabular figures for dates/scores.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
