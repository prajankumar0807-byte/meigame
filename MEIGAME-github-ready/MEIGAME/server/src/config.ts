import "dotenv/config";

const required = ["DATABASE_URL", "JWT_SECRET"] as const;
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET!,
  cookieSecure: process.env.COOKIE_SECURE === "true"
};
