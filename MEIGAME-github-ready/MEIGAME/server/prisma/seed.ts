import "dotenv/config";
import { PrismaClient, Role, Permission } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const admins = [
    {
      username: process.env.ADMIN1_USERNAME ?? "mecprajan",
      password: process.env.ADMIN1_PASSWORD ?? "mahendra@123",
      fullName: process.env.ADMIN1_NAME ?? "MEIGAME Super Admin"
    },
    {
      username: process.env.ADMIN2_USERNAME ?? "mecraju",
      password: process.env.ADMIN2_PASSWORD ?? "mahendra@123",
      fullName: process.env.ADMIN2_NAME ?? "MEIGAME Super Admin"
    }
  ];

  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, 12);
    await prisma.user.upsert({
      where: { username: admin.username },
      update: { fullName: admin.fullName, passwordHash, role: Role.SUPER_ADMIN, isActive: true },
      create: {
        username: admin.username,
        fullName: admin.fullName,
        passwordHash,
        role: Role.SUPER_ADMIN
      }
    });
  }

  console.log("Seeded Super Admin accounts:", admins.map(a => a.username).join(", "));
  console.log("Available staff permissions:", Object.values(Permission).join(", "));
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
