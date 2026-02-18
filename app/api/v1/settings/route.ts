import { NextResponse } from "next/server";
import {
  getWaitlistEnabled,
  getAllSettings,
  setMultipleSettings,
} from "@/lib/settings";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json({
      waitlistEnabled: settings.waitlistEnabled === "true",
      dgbMode: settings.dgbMode || "mock",
      dgbRpcHost: settings.dgbRpcHost || "localhost",
      dgbRpcPort: settings.dgbRpcPort || "14022",
      dgbRpcUser: settings.dgbRpcUser || "digibyte",
      dgbConfirmationsRequired: Number(
        settings.dgbConfirmationsRequired || "6"
      ),
      dgbAddressRotation: settings.dgbAddressRotation === "true",
      sessionTimeout: Number(settings.sessionTimeout || "30"),
      maxLoginAttempts: Number(settings.maxLoginAttempts || "5"),
      maxWithdrawalPerHour: Number(settings.maxWithdrawalPerHour || "3"),
      maxApiCallsPerMinute: Number(settings.maxApiCallsPerMinute || "60"),
      defaultExamDuration: Number(settings.defaultExamDuration || "60"),
      defaultPassMark: Number(settings.defaultPassMark || "70"),
      allowExamRetakes: settings.allowExamRetakes === "true",
      showAnswersAfterCompletion:
        settings.showAnswersAfterCompletion === "true",
    });
  } catch {
    // If DB not available, return defaults
    return NextResponse.json({
      waitlistEnabled: true,
      dgbMode: "mock",
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updates: Record<string, string> = {};

    if (typeof body.waitlistEnabled === "boolean") {
      updates.waitlistEnabled = String(body.waitlistEnabled);
    }
    if (typeof body.dgbMode === "string") {
      updates.dgbMode = body.dgbMode;
    }
    if (typeof body.dgbRpcHost === "string") {
      updates.dgbRpcHost = body.dgbRpcHost;
    }
    if (typeof body.dgbRpcPort === "string" || typeof body.dgbRpcPort === "number") {
      updates.dgbRpcPort = String(body.dgbRpcPort);
    }
    if (typeof body.dgbRpcUser === "string") {
      updates.dgbRpcUser = body.dgbRpcUser;
    }
    if (typeof body.dgbRpcPass === "string") {
      updates.dgbRpcPass = body.dgbRpcPass;
    }
    if (typeof body.dgbConfirmationsRequired === "number") {
      updates.dgbConfirmationsRequired = String(body.dgbConfirmationsRequired);
    }
    if (typeof body.dgbAddressRotation === "boolean") {
      updates.dgbAddressRotation = String(body.dgbAddressRotation);
    }
    if (typeof body.sessionTimeout === "number") {
      updates.sessionTimeout = String(body.sessionTimeout);
    }
    if (typeof body.maxLoginAttempts === "number") {
      updates.maxLoginAttempts = String(body.maxLoginAttempts);
    }
    if (typeof body.maxWithdrawalPerHour === "number") {
      updates.maxWithdrawalPerHour = String(body.maxWithdrawalPerHour);
    }
    if (typeof body.maxApiCallsPerMinute === "number") {
      updates.maxApiCallsPerMinute = String(body.maxApiCallsPerMinute);
    }
    if (typeof body.defaultExamDuration === "number") {
      updates.defaultExamDuration = String(body.defaultExamDuration);
    }
    if (typeof body.defaultPassMark === "number") {
      updates.defaultPassMark = String(body.defaultPassMark);
    }
    if (typeof body.allowExamRetakes === "boolean") {
      updates.allowExamRetakes = String(body.allowExamRetakes);
    }
    if (typeof body.showAnswersAfterCompletion === "boolean") {
      updates.showAnswersAfterCompletion = String(
        body.showAnswersAfterCompletion
      );
    }

    if (Object.keys(updates).length > 0) {
      await setMultipleSettings(updates);
    }

    const waitlistEnabled = await getWaitlistEnabled();
    return NextResponse.json({ waitlistEnabled, ...updates });
  } catch (error) {
    return handleAuthError(error);
  }
}
