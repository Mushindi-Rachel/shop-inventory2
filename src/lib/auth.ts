import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "shop_auth";

export function checkPassword(password: string) {
  return password === (process.env.ADMIN_PASSWORD || "Nyabondex@26");
}

export function tokenValue() {
  return "authenticated";
}

export async function isAuthed() {
  const store = await cookies();
  const cookie = store.get(AUTH_COOKIE_NAME);

  return cookie?.value === "authenticated";
}