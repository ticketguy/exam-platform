import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nocho.ng" },
    update: {},
    create: {
      name: "Chief Idoko",
      nickname: "chiefidoko",
      email: "admin@nocho.ng",
      passwordHash: adminPasswordHash,
      role: "admin",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      wallet: {
        create: {
          balance: 0,
          dgbAddress: "DGBadmin_mock_address",
        },
      },
    },
  });
  console.log(`  Admin user created: ${admin.email}`);

  // Create demo user
  const demoPasswordHash = await bcrypt.hash("demo123", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@nocho.ng" },
    update: {},
    create: {
      name: "Demo User",
      nickname: "AceBrain",
      email: "demo@nocho.ng",
      passwordHash: demoPasswordHash,
      role: "user",
      bio: "Knowledge trader since day one.",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      wallet: {
        create: {
          balance: 500,
          dgbAddress: "DGBdemo_mock_address",
        },
      },
    },
  });
  console.log(`  Demo user created: ${demo.email}`);

  // Create default platform settings
  const defaultSettings = [
    { key: "waitlistEnabled", value: "true" },
    { key: "dgbMode", value: "mock" },
    { key: "dgbRpcHost", value: "localhost" },
    { key: "dgbRpcPort", value: "14022" },
    { key: "dgbRpcUser", value: "digibyte" },
    { key: "dgbRpcPass", value: "" },
    { key: "dgbConfirmationsRequired", value: "6" },
    { key: "dgbAddressRotation", value: "true" },
    { key: "sessionTimeout", value: "30" },
    { key: "maxLoginAttempts", value: "5" },
    { key: "maxWithdrawalPerHour", value: "3" },
    { key: "maxApiCallsPerMinute", value: "60" },
    { key: "defaultExamDuration", value: "60" },
    { key: "defaultPassMark", value: "70" },
    { key: "allowExamRetakes", value: "true" },
    { key: "showAnswersAfterCompletion", value: "false" },
  ];

  for (const setting of defaultSettings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`  ${defaultSettings.length} platform settings created`);

  // Create a sample exam with questions
  const exam = await prisma.exam.create({
    data: {
      title: "Mathematics Sprint 2025",
      description:
        "Comprehensive mathematics assessment covering algebra, geometry, and arithmetic. Test your skills against other knowledge traders!",
      category: "Mathematics",
      difficulty: "Medium",
      duration: 60,
      passmark: 70,
      entryFee: 50,
      prizePool: 5000,
      published: true,
      publishedAt: new Date(),
      questions: {
        create: [
          {
            questionText: "What is 15 x 12?",
            options: JSON.stringify(["160", "180", "170", "150"]),
            correctAnswer: 1,
            points: 1,
            orderIndex: 0,
          },
          {
            questionText:
              "If x + 5 = 12, what is x?",
            options: JSON.stringify(["5", "6", "7", "8"]),
            correctAnswer: 2,
            points: 1,
            orderIndex: 1,
          },
          {
            questionText: "What is the square root of 144?",
            options: JSON.stringify(["10", "11", "12", "14"]),
            correctAnswer: 2,
            points: 1,
            orderIndex: 2,
          },
          {
            questionText: "What is 25% of 200?",
            options: JSON.stringify(["25", "40", "50", "75"]),
            correctAnswer: 2,
            points: 1,
            orderIndex: 3,
          },
          {
            questionText: "What is the area of a rectangle with length 8 and width 5?",
            options: JSON.stringify(["13", "26", "40", "45"]),
            correctAnswer: 2,
            points: 1,
            orderIndex: 4,
          },
        ],
      },
    },
  });
  console.log(`  Sample exam created: ${exam.title} (${exam.id})`);

  // Create a welcome notification for the demo user
  await prisma.notification.create({
    data: {
      userId: demo.id,
      title: "Welcome to Nocho!",
      message:
        "Your account is set up and ready. Explore knowledge arenas and start earning!",
    },
  });
  console.log("  Welcome notification created for demo user");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
