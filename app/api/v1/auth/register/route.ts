import { NextResponse } from "next/server";
import { createUser, userToPublic } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const { name, nickname, email, password } = await req.json();

    if (!name || !nickname || !email || !password) {
      return NextResponse.json(
        { detail: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { detail: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const result = createUser({ name, nickname, email, password });

    if ("error" in result) {
      return NextResponse.json({ detail: result.error }, { status: 409 });
    }

    return NextResponse.json({
      ...userToPublic(result),
      token: `mock-jwt-${result.id}`,
    });
  } catch {
    return NextResponse.json(
      { detail: "Invalid request" },
      { status: 400 }
    );
  }
}
