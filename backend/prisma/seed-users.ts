import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await hashPassword("test123");

  // Customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@test.com",
      phone: "01711111111",
      password,
      role: "CUSTOMER",
    },
  });
  console.log("✅ Customer:", customer.email, "/ test123");

  // Manager (Dhaka)
  const manager = await prisma.user.upsert({
    where: { email: "manager@test.com" },
    update: {},
    create: {
      name: "Test Manager",
      email: "manager@test.com",
      phone: "01722222222",
      password,
      role: "MANAGER",
    },
  });

  await prisma.managerProfile.upsert({
    where: { userId: manager.id },
    update: {},
    create: {
      userId: manager.id,
      assignedZila: "Dhaka",
      assignedDistrict: "Dhaka",
    },
  });
  console.log("✅ Manager:", manager.email, "/ test123");

  // Rider (Dhaka)
  const rider = await prisma.user.upsert({
    where: { email: "rider@test.com" },
    update: {},
    create: {
      name: "Test Rider",
      email: "rider@test.com",
      phone: "01733333333",
      password,
      role: "RIDER",
    },
  });

  await prisma.riderProfile.upsert({
    where: { userId: rider.id },
    update: {},
    create: {
      userId: rider.id,
      assignedZila: "Dhaka",
      vehicleType: "Motorcycle",
      licenseNumber: "BD-RIDER-001",
      isAvailable: true,
      currentLat: 23.7925,
      currentLng: 90.4078,
    },
  });
  console.log("✅ Rider:", rider.email, "/ test123");

  // Second manager (Chattogram)
  const manager2 = await prisma.user.upsert({
    where: { email: "manager2@test.com" },
    update: {},
    create: {
      name: "Chattogram Manager",
      email: "manager2@test.com",
      phone: "01744444444",
      password,
      role: "MANAGER",
    },
  });

  await prisma.managerProfile.upsert({
    where: { userId: manager2.id },
    update: {},
    create: {
      userId: manager2.id,
      assignedZila: "Chattogram",
      assignedDistrict: "Chattogram",
    },
  });
  console.log("✅ Manager2:", manager2.email, "/ test123");

  // Third manager (Feni)
  const manager3 = await prisma.user.upsert({
    where: { email: "manager3@test.com" },
    update: {},
    create: {
      name: "Feni Manager",
      email: "manager3@test.com",
      phone: "01766666666",
      password,
      role: "MANAGER",
    },
  });

  await prisma.managerProfile.upsert({
    where: { userId: manager3.id },
    update: {},
    create: {
      userId: manager3.id,
      assignedZila: "Feni",
      assignedDistrict: "Feni",
    },
  });
  console.log("✅ Manager3:", manager3.email, "/ test123");

  // Third rider (Feni)
  const rider3 = await prisma.user.upsert({
    where: { email: "rider3@test.com" },
    update: {},
    create: {
      name: "Feni Rider",
      email: "rider3@test.com",
      phone: "01777777777",
      password,
      role: "RIDER",
    },
  });

  await prisma.riderProfile.upsert({
    where: { userId: rider3.id },
    update: {},
    create: {
      userId: rider3.id,
      assignedZila: "Feni",
      vehicleType: "Motorcycle",
      licenseNumber: "BD-RIDER-003",
      isAvailable: true,
      currentLat: 23.0155,
      currentLng: 91.3977,
    },
  });
  console.log("✅ Rider3:", rider3.email, "/ test123");

  // Second rider (Chattogram)
  const rider2 = await prisma.user.upsert({
    where: { email: "rider2@test.com" },
    update: {},
    create: {
      name: "Chattogram Rider",
      email: "rider2@test.com",
      phone: "01755555555",
      password,
      role: "RIDER",
    },
  });

  await prisma.riderProfile.upsert({
    where: { userId: rider2.id },
    update: {},
    create: {
      userId: rider2.id,
      assignedZila: "Chattogram",
      vehicleType: "Bicycle",
      licenseNumber: "BD-RIDER-002",
      isAvailable: true,
      currentLat: 22.3569,
      currentLng: 91.7832,
    },
  });
  console.log("✅ Rider2:", rider2.email, "/ test123");

  console.log("\n🎉 All test users created!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("All passwords: test123");
  console.log("Admin:     admin@bikroymart.com / admin123");
  console.log("Customer:  customer@test.com / test123");
  console.log("Manager:   manager@test.com / test123 (Dhaka)");
  console.log("Rider:     rider@test.com / test123 (Dhaka)");
  console.log("Manager2:  manager2@test.com / test123 (Chattogram)");
  console.log("Manager3:  manager3@test.com / test123 (Feni)");
  console.log("Rider:     rider@test.com / test123 (Dhaka)");
  console.log("Rider2:    rider2@test.com / test123 (Chattogram)");
  console.log("Rider3:    rider3@test.com / test123 (Feni)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
