import prisma from "./prisma";

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.platformSetting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.platformSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getWaitlistEnabled(): Promise<boolean> {
  const value = await getSetting("waitlistEnabled");
  return value === "true";
}

export async function setWaitlistEnabled(enabled: boolean): Promise<void> {
  await setSetting("waitlistEnabled", String(enabled));
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.platformSetting.findMany();
  const result: Record<string, string> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
}

export async function setMultipleSettings(
  settings: Record<string, string>
): Promise<void> {
  const operations = Object.entries(settings).map(([key, value]) =>
    prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );
  await prisma.$transaction(operations);
}
