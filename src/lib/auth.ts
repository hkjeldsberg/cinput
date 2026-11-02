import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SESSION_COOKIE, verifyToken } from "./session";

/** Call at the top of every data read and Server Action. */
export async function requireAuth(): Promise<void> {
  // Session checks compare against the current time, so they must run at request time.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifyToken(token))) redirect("/login");
}
