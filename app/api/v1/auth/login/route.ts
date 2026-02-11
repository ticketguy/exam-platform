import { NextResponse } from "next/server";
import { findUserByEmail, userToPublic } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { detail: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      return NextResponse.json(
        { detail: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ...userToPublic(user),
      token: `mock-jwt-${user.id}`,
    });
  } catch {
    return NextResponse.json(
      { detail: "Invalid request" },
      { status: 400 }
    );
  }
}
