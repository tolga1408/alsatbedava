import { describe, expect, it } from "vitest";
import { readSitesIdentity } from "../auth";

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
