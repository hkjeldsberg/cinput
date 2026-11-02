// Signed session token (Web Crypto, so it runs in both proxy and server code).
// Token format: `<expiresAtMs>.<base64url HMAC-SHA256 of "cinput:<expiresAtMs>">`.

export const SESSION_COOKIE = "cinput_session";
export const SESSION_DAYS = 30;

const enc = new TextEncoder();

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set (32+ chars)");
  return s;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createToken(now = Date.now()): Promise<{ token: string; expires: Date }> {
  const exp = now + SESSION_DAYS * 86_400_000;
  return { token: `${exp}.${await hmac(`cinput:${exp}`)}`, expires: new Date(exp) };
}

export async function verifyToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !(Number(exp) > now)) return false;
  return safeEqual(sig, await hmac(`cinput:${exp}`));
}

/** Constant-time password check against APP_PASSWORD. */
export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new Error("APP_PASSWORD must be set");
  return safeEqual(await hmac(`pw:${input}`), await hmac(`pw:${expected}`));
}
