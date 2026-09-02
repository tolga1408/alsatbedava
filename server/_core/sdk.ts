import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios, { type AxiosInstance } from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import type {
  ExchangeTokenResponse,
  GetUserInfoResponse,
  OAuthTokenEndpointResponse,
  OAuthUserInfoResponse,
} from "./types/oauthTypes";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const optionalString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const requiredString = (value: unknown): string | null => {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number") return String(value);
  return null;
};

export type SessionPayload = {
  openId: string;
  clientId: string;
  name: string;
};

class OAuthService {
  constructor(private client: AxiosInstance) {
    if (!ENV.oauthTokenUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_TOKEN_URL is not configured. Set OAUTH_TOKEN_URL in the environment."
      );
    }
    if (!ENV.oauthUserInfoUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_USERINFO_URL is not configured. Set OAUTH_USERINFO_URL in the environment."
      );
    }
  }

  private decodeState(state: string): string {
    const redirectUri = Buffer.from(state, "base64").toString("utf8");
    if (!redirectUri) {
      throw new Error("Invalid OAuth state");
    }
    return redirectUri;
  }

  private assertTokenConfig() {
    const missing = [
      ["VITE_OAUTH_CLIENT_ID", ENV.oauthClientId],
      ["OAUTH_TOKEN_URL", ENV.oauthTokenUrl],
    ].filter(([, value]) => !value);

    if (missing.length > 0) {
      throw new Error(
        `OAuth token exchange is not configured: ${missing
          .map(([name]) => name)
          .join(", ")}`
      );
    }
  }

  async getTokenByCode(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    this.assertTokenConfig();

    const payload = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.decodeState(state),
      client_id: ENV.oauthClientId,
    });

    if (ENV.oauthClientSecret) {
      payload.set("client_secret", ENV.oauthClientSecret);
    }

    const { data } = await this.client.post<OAuthTokenEndpointResponse>(
      ENV.oauthTokenUrl,
      payload,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = data.access_token ?? data.accessToken;
    if (!isNonEmptyString(accessToken)) {
      throw new Error("OAuth token response did not include an access token");
    }

    return {
      accessToken,
      tokenType: data.token_type ?? data.tokenType ?? "Bearer",
      expiresIn: Number(data.expires_in ?? data.expiresIn ?? 0),
      refreshToken: data.refresh_token ?? data.refreshToken,
      scope: data.scope ?? "",
      idToken: data.id_token ?? data.idToken ?? "",
    };
  }

  async getUserInfoByToken(
    token: ExchangeTokenResponse
  ): Promise<GetUserInfoResponse> {
    if (!ENV.oauthUserInfoUrl) {
      throw new Error("OAUTH_USERINFO_URL is not configured");
    }

    const { data } = await this.client.get<OAuthUserInfoResponse>(
      ENV.oauthUserInfoUrl,
      {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${token.accessToken}`,
        },
      }
    );

    const openId =
      requiredString(data.sub) ??
      requiredString(data.openId) ??
      requiredString(data.id) ??
      requiredString(data.user_id);

    if (!openId) {
      throw new Error(
        "OAuth user info response did not include a stable user identifier"
      );
    }

    const loginMethod = this.deriveLoginMethod(
      data.platforms,
      data.loginMethod ?? data.platform ?? null
    );

    return {
      openId,
      name:
        optionalString(data.name) ??
        optionalString(data.preferred_username) ??
        optionalString(data.email) ??
        openId,
      email: optionalString(data.email),
      platform: optionalString(data.platform),
      loginMethod,
    };
  }

  private deriveLoginMethod(
    platforms: unknown,
    fallback: string | null | undefined
  ): string | null {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set<string>(
      platforms.filter((p): p is string => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (
      set.has("REGISTERED_PLATFORM_MICROSOFT") ||
      set.has("REGISTERED_PLATFORM_AZURE")
    ) {
      return "microsoft";
    }
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
}

const createOAuthHttpClient = (): AxiosInstance =>
  axios.create({
    timeout: AXIOS_TIMEOUT_MS,
  });

class SDKServer {
  private readonly oauthService: OAuthService;

  constructor(client: AxiosInstance = createOAuthHttpClient()) {
    this.oauthService = new OAuthService(client);
  }

  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    return this.oauthService.getTokenByCode(code, state);
  }

  async getUserInfo(accessToken: string): Promise<GetUserInfoResponse> {
    return this.oauthService.getUserInfoByToken({
      accessToken,
      tokenType: "Bearer",
      expiresIn: 0,
      scope: "",
      idToken: "",
    });
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    return this.signSession(
      {
        openId,
        clientId: ENV.oauthClientId,
        name: options.name || "",
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      clientId: payload.clientId,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, clientId, name } = payload as Record<
        string,
        unknown
      >;
      const sessionClientId = requiredString(clientId);

      if (!isNonEmptyString(openId) || !sessionClientId) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        openId,
        clientId: sessionClientId,
        name: typeof name === "string" ? name : "",
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const signedInAt = new Date();
    let user = await db.getUserByOpenId(session.openId);

    if (!user) {
      await db.upsertUser({
        openId: session.openId,
        name: session.name || null,
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(session.openId);
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export const sdk = new SDKServer();
