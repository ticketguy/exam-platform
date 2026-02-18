import bcrypt from "bcryptjs";
import prisma from "./prisma";
import type { User } from "@prisma/client";

export type { User };

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByNickname(
  nickname: string
): Promise<User | null> {
  return prisma.user.findUnique({ where: { nickname } });
}

export async function createUser(data: {
  name: string;
  nickname: string;
  email: string;
  password: string;
}): Promise<User | { error: string }> {
  const existingEmail = await findUserByEmail(data.email);
  if (existingEmail) {
    return { error: "Email already registered" };
  }

  const existingNickname = await findUserByNickname(data.nickname);
  if (existingNickname) {
    return { error: "Nickname already taken" };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      nickname: data.nickname,
      email: data.email,
      passwordHash,
      role: "user",
    },
  });

  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "name" | "nickname" | "bio" | "avatar">>
): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

export function userToPublic(user: User) {
  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}
