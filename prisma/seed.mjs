import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email    = process.env.ADMIN_EMAIL    ?? "admin@email.com";
const password = process.env.ADMIN_PASSWORD ?? "password";
const hashed   = await bcrypt.hash(password, 12);

const existing = await prisma.user.findUnique({ where: { email } });

if (existing) {
  await prisma.user.update({
    where: { email },
    data:  { name: "Admin", email, password: hashed, role: "admin" },
  });
  console.log("Existing admin user updated");
} else {
  await prisma.user.create({
    data: { name: "Admin", email, password: hashed, role: "admin" },
  });
  console.log("New admin user created");
}

await prisma.$disconnect();
process.exit(0);
