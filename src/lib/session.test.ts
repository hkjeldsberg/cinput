import { beforeAll, describe, expect, it } from "vitest";
import { checkPassword, createToken, verifyToken } from "./session";

beforeAll(() => {
  process.env.AUTH_SECRET = "x".repeat(40);
  process.env.APP_PASSWORD = "hola-mundo";
});

describe("session", () => {
  it("accepts a fresh token and rejects tampered or expired ones", async () => {
    const { token } = await createToken(1_000);
    expect(await verifyToken(token, 2_000)).toBe(true);
    expect(await verifyToken(token.slice(0, -1) + "A", 2_000)).toBe(false);
    expect(await verifyToken(`9${token}`, 2_000)).toBe(false);
    expect(await verifyToken(token, 1_000 + 31 * 86_400_000)).toBe(false);
    expect(await verifyToken(undefined)).toBe(false);
  });
  it("checks the password", async () => {
    expect(await checkPassword("hola-mundo")).toBe(true);
    expect(await checkPassword("hola")).toBe(false);
  });
});
