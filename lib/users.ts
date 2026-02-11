import crypto from "crypto";

export interface StoredUser {
  id: string;
  name: string;
  nickname: string;
  email: string;
  password: string;
  role: "user" | "admin";
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

// In-memory user store (resets on server restart)
const users: Map<string, StoredUser> = new Map();

// Seed a default admin
const adminId = "admin-001";
users.set(adminId, {
  id: adminId,
  name: "Chief Idoko",
  nickname: "chiefidoko",
  email: "admin@nocho.ng",
  password: "admin123",
  role: "admin",
  avatar: null,
  bio: null,
  createdAt: new Date().toISOString(),
});

// Seed a demo user
const demoId = "user-001";
users.set(demoId, {
  id: demoId,
  name: "Demo User",
  nickname: "AceBrain",
  email: "demo@nocho.ng",
  password: "demo123",
  role: "user",
  avatar: null,
  bio: "Knowledge trader since day one.",
  createdAt: new Date().toISOString(),
});

export function findUserByEmail(email: string): StoredUser | undefined {
  for (const user of users.values()) {
    if (user.email === email) return user;
  }
  return undefined;
}

export function findUserById(id: string): StoredUser | undefined {
  return users.get(id);
}

export function findUserByNickname(nickname: string): StoredUser | undefined {
  for (const user of users.values()) {
    if (user.nickname === nickname) return user;
  }
  return undefined;
}

export function createUser(data: {
  name: string;
  nickname: string;
  email: string;
  password: string;
}): StoredUser | { error: string } {
  if (findUserByEmail(data.email)) {
    return { error: "Email already registered" };
  }
  if (findUserByNickname(data.nickname)) {
    return { error: "Nickname already taken" };
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: data.name,
    nickname: data.nickname,
    email: data.email,
    password: data.password,
    role: "user",
    avatar: null,
    bio: null,
    createdAt: new Date().toISOString(),
  };

  users.set(user.id, user);
  return user;
}

export function updateUser(
  id: string,
  data: Partial<Pick<StoredUser, "name" | "nickname" | "bio" | "avatar">>
): StoredUser | null {
  const user = users.get(id);
  if (!user) return null;

  if (data.name !== undefined) user.name = data.name;
  if (data.nickname !== undefined) user.nickname = data.nickname;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.avatar !== undefined) user.avatar = data.avatar;

  users.set(id, user);
  return user;
}

export function userToPublic(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

// --- Platform settings (in-memory) ---
let waitlistEnabled = true;

export function getWaitlistEnabled(): boolean {
  return waitlistEnabled;
}

export function setWaitlistEnabled(enabled: boolean): void {
  waitlistEnabled = enabled;
}
