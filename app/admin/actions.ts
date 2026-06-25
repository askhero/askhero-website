"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const cookieName = "askhero_admin";

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") || "");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(cookieName, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
  redirect("/admin");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value === "authenticated";
}
