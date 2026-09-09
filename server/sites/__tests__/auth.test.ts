import { describe, expect, it } from "vitest";
import {
  BETA_SESSION_COOKIE,
  clearBetaSessionCookie,
  createBetaSessionCookie,
  readBetaIdentity,
  readSitesIdentity,
} from "../auth";

describe("readSitesIdentity", () => {
  it("returns null for anonymous visitors", () => {
    expect(readSitesIdentity(new Request("https://example.com"))).toBeNull();
  });

  it("reads and decodes a signed-in Sites visitor", () => {
    const request = new Request("https://example.com", {
      headers: {
        "oai-authenticated-user-id": "visitor-123",
        "oai-authenticated-user-email": "tester@example.com",
        "oai-authenticated-user-full-name": "Test%20User",
        "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
      },
    });

    expect(readSitesIdentity(request)).toEqual({
      openId: "visitor-123",
      email: "tester@example.com",
      name: "Test User",
      loginMethod: "chatgpt",
    });
  });

  it("falls back to email when the name header is invalid", () => {
    const request = new Request("https://example.com", {
      headers: {
        "oai-authenticated-user-id": "visitor-123",
        "oai-authenticated-user-email": "tester@example.com",
        "oai-authenticated-user-full-name": "%E0%A4%A",
        "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
      },
    });

    expect(readSitesIdentity(request)?.name).toBe("tester@example.com");
  });
});

describe("beta test session", () => {
  const sessionId = "123e4567-e89b-42d3-a456-426614174000";

  it("reads a valid beta session cookie", () => {
    const request = new Request("https://example.com", {
      headers: { cookie: `${BETA_SESSION_COOKIE}=${sessionId}` },
    });

    expect(readBetaIdentity(request)).toEqual({
      openId: `beta:${sessionId}`,
      email: null,
      name: "Test Kullanıcısı",
      loginMethod: "beta",
    });
  });

  it("rejects a forged beta session value", () => {
    const request = new Request("https://example.com", {
      headers: { cookie: `${BETA_SESSION_COOKIE}=not-a-session` },
    });

    expect(readBetaIdentity(request)).toBeNull();
  });

  it("creates secure login and logout cookies", () => {
    expect(createBetaSessionCookie(sessionId)).toContain(
      `${BETA_SESSION_COOKIE}=${sessionId}`
    );
    expect(createBetaSessionCookie(sessionId)).toContain("HttpOnly; Secure");
    expect(clearBetaSessionCookie()).toContain("Max-Age=0");
  });
});
