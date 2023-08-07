import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { superAdminUsers } from "../../data/superadmin.js";
import bcryptjs from "bcryptjs";

const seedSuperAdminUsers = async () => {
  // superAdminUsers is an array of objects
  superAdminUsers.forEach((user) => {
    const salt = bcryptjs.genSaltSync();
    const hashedPassword = bcryptjs.hashSync(user.password, salt);
    user.password = hashedPassword;
    console.log(user);
  });

  await prisma.user.createMany({
    data: superAdminUsers,
  });
};

seedSuperAdminUsers()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Super admin users successfully created");
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

export { seedSuperAdminUsers };
