import { NextResponse } from "next/server";
import { getWaitlistEnabled, setWaitlistEnabled } from "@/lib/users";

export async function GET() {
  return NextResponse.json({ waitlistEnabled: getWaitlistEnabled() });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (typeof body.waitlistEnabled === "boolean") {
      setWaitlistEnabled(body.waitlistEnabled);
    }

    return NextResponse.json({ waitlistEnabled: getWaitlistEnabled() });
  } catch {
    return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
  }
}
