import { z } from "zod/v4";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nickname: z
    .string()
    .min(3, "Nickname must be at least 3 characters")
    .max(20, "Nickname must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Nickname can only contain letters, numbers, and underscores"
    ),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  nickname: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export const createExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  duration: z.number().int().min(1).max(240),
  passmark: z.number().int().min(0).max(100),
  entryFee: z.number().min(0).default(0),
  prizePool: z.number().min(0).default(0),
  published: z.boolean().default(false),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1),
        options: z.array(z.string().min(1)).length(4),
        correctAnswer: z.number().int().min(0).max(3),
        points: z.number().int().min(1).default(1),
      })
    )
    .min(1, "At least one question is required"),
});

export const updateExamSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  duration: z.number().int().min(1).max(240).optional(),
  passmark: z.number().int().min(0).max(100).optional(),
  entryFee: z.number().min(0).optional(),
  prizePool: z.number().min(0).optional(),
  published: z.boolean().optional(),
  questions: z
    .array(
      z.object({
        id: z.string().optional(),
        questionText: z.string().min(1),
        options: z.array(z.string().min(1)).length(4),
        correctAnswer: z.number().int().min(0).max(3),
        points: z.number().int().min(1).default(1),
      })
    )
    .optional(),
});

export const submitAnswersSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
});

export const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  destinationAddress: z.string().min(20, "Invalid address"),
});

export const adjustBalanceSchema = z.object({
  userId: z.string().min(1),
  amount: z.number(),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

export const waitlistSchema = z.object({
  email: z.email("Invalid email address"),
});

export const addAdminSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["admin"]).default("admin"),
});
