import { NextResponse } from "next/server";
import { findUserById, updateUser, userToPublic } from "@/lib/users";

function getUserIdFromAuth(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer mock-jwt-")) return null;
  return auth.replace("Bearer mock-jwt-", "");
}

export async function GET(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const user = findUserById(userId);
  if (!user) {
    return NextResponse.json({ detail: "User not found" }, { status: 404 });
  }

  return NextResponse.json(userToPublic(user));
}

export async function PATCH(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = updateUser(userId, body);

    if (!updated) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userToPublic(updated));
  } catch {
    return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
  }
}
