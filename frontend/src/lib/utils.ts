import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Relative app routes (/camp, /profile). Use React Router Link instead of `<a href>`. */
export function isInternalAppPath(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

