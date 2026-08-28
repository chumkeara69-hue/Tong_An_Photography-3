import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!databaseUrl) throw new Error("DATABASE_URL or DIRECT_URL is required.");

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@tong-an.local").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", name: "Tong An Admin" },
    create: {
      email,
      name: "Tong An Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  for (const name of ["Landscape", "Portrait", "Nature", "Architecture"]) {
    await prisma.category.upsert({
      where: { slug: name.toLowerCase() },
      update: { name },
      create: { name, slug: name.toLowerCase() },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
