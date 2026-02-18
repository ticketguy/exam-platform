import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, userToPublic } from "@/lib/users";
import { loginSchema } from "@/lib/validation";
import { rateLimitLogin } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { allowed } = rateLimitLogin(ip);
    if (!allowed) {
      return NextResponse.json(
        { detail: "Too many login attempts. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { detail: "Email and password are required" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { detail: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { detail: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json(userToPublic(user));
  } catch {
    return NextResponse.json(
      { detail: "Invalid request" },
      { status: 400 }
    );
  }
}
