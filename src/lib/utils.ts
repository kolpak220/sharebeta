import { clsx, type ClassValue } from "clsx";
import Cookies from "js-cookie";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuth() {
  const id = Cookies.get("id");
  const token = Cookies.get("token");
  return { id, token };
}
