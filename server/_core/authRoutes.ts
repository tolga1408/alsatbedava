import type { Express, Request, Response } from "express";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { createSessionToken, createUser, findUserByEmail, hashPassword, verifyPassword } from "./auth";
import { getSessionCookieOptions } from "./cookies";

const credentialsSchema = z.object({
  email: z.string().email().transform(value => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(120),
});

async function setSession(res: Response, req: Request, userId: number) {
  const token = await createSessionToken(userId);
  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: ONE_YEAR_MS,
    httpOnly: true,
  });
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Geçersiz kayıt bilgileri" });
    if (await findUserByEmail(parsed.data.email)) {
      return res.status(409).json({ error: "Bu e-posta zaten kayıtlı" });
    }
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    });
    if (!user) return res.status(500).json({ error: "Kullanıcı oluşturulamadı" });
    await setSession(res, req, user.id);
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Geçersiz giriş bilgileri" });
    const user = await findUserByEmail(parsed.data.email);
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı" });
    }
    await setSession(res, req, user.id);
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  });
}
