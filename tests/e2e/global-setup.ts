import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { encode } from "next-auth/jwt";
import type { FullConfig } from "@playwright/test";

export default async function globalSetup(_config: FullConfig) {
  loadEnv({ path: ".env.local" });
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("NEXTAUTH_SECRET debe configurarse para las pruebas E2E.");
  }

  const token = await encode({
    secret,
    token: {
      sub: "pulsemarket-e2e-user",
      name: "PulseMarket E2E",
      email: "pulsemarket-e2e@example.test",
    },
    maxAge: 60 * 60,
  });
  const authDirectory = path.resolve(".auth");

  await mkdir(authDirectory, { recursive: true });
  await writeFile(
    path.join(authDirectory, "user.json"),
    JSON.stringify({
      cookies: [
        {
          name: "next-auth.session-token",
          value: token,
          domain: "localhost",
          path: "/",
          expires: Math.floor(Date.now() / 1000) + 60 * 60,
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    }),
  );
}
