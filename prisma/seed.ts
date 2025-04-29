import prisma from "../src/lib/prisma.js"; // 👈 must use .js when using ts-node/esm
import bcrypt from "bcryptjs";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@email.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "password";

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("Existing admin user updated");
  } else {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("New admin user created");
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
