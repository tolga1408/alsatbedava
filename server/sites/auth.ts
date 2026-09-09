import type { D1Database } from "./platform";
import type { BetaUser } from "./database";

const USER_ID_HEADER = "oai-authenticated-user-id";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
export const BETA_SESSION_COOKIE = "alsatbedava_beta_session";
const BETA_SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const BETA_SESSION_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function decodeFullName(request: Request): string | null {
  const encodedName = request.headers.get(USER_FULL_NAME_HEADER);
  const encoding = request.headers.get(USER_FULL_NAME_ENCODING_HEADER);
  if (!encodedName || encoding !== "percent-encoded-utf-8") return null;

  try {
    return decodeURIComponent(encodedName);
  } catch {
    return null;
  }
}

export function readSitesIdentity(request: Request) {
  const openId = request.headers.get(USER_ID_HEADER)?.trim();
  const email = request.headers.get(USER_EMAIL_HEADER)?.trim();
  if (!openId || !email) return null;

  return {
    openId,
    email,
    name: decodeFullName(request) ?? email,
    loginMethod: "chatgpt",
  };
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");
    if (key !== name) continue;
    try {
      return decodeURIComponent(valueParts.join("="));
    } catch {
      return null;
    }
  }

  return null;
}

export function readBetaIdentity(request: Request) {
  const sessionId = readCookie(request, BETA_SESSION_COOKIE);
  if (!sessionId || !BETA_SESSION_PATTERN.test(sessionId)) return null;

  return {
    openId: `beta:${sessionId}`,
    email: null,
    name: "Test Kullanıcısı",
    loginMethod: "beta",
  };
}

export function createBetaSessionCookie(sessionId = crypto.randomUUID()) {
  return `${BETA_SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${BETA_SESSION_MAX_AGE}`;
}

export function clearBetaSessionCookie() {
  return `${BETA_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function getOrCreateSitesUser(
  request: Request,
  db: D1Database
): Promise<BetaUser | null> {
  const identity = readBetaIdentity(request) ?? readSitesIdentity(request);
  if (!identity) return null;

  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO users (
        open_id, name, email, login_method, role,
        created_at, updated_at, last_signed_in
      ) VALUES (?, ?, ?, ?, 'user', ?, ?, ?)
      ON CONFLICT(open_id) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        updated_at = excluded.updated_at,
        last_signed_in = excluded.last_signed_in`
    )
    .bind(
      identity.openId,
      identity.name,
      identity.email,
      identity.loginMethod,
      now,
      now,
      now
    )
    .run();

  const row = await db
    .prepare(
      `SELECT
        id,
        open_id AS openId,
        name,
        email,
        login_method AS loginMethod,
        role,
        created_at AS createdAt,
        updated_at AS updatedAt,
        last_signed_in AS lastSignedIn
      FROM users
      WHERE open_id = ?`
    )
    .bind(identity.openId)
    .first<BetaUserRow>();

  return row ? hydrateUser(row) : null;
}

type BetaUserRow = Omit<
  BetaUser,
  "createdAt" | "updatedAt" | "lastSignedIn"
> & {
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
};

function hydrateUser(row: BetaUserRow): BetaUser {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    lastSignedIn: new Date(row.lastSignedIn),
  };
}
