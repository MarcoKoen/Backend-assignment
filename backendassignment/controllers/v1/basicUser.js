import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import axios from "axios";
import bcryptjs from "bcryptjs";

const seedData = async (req, res) => {
  let loggedInUser = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
  });

  if (loggedInUser.role === "SUPER_ADMIN") {
    try {
      const response = await axios.get(
        "https://gist.githubusercontent.com/MarcoKoen/5774653345062feacab0937a2db592a4/raw"
      ); // Replace with your baseURL
      // console.log(response.data);
      // Process the data as needed

      response.data.forEach((user) => {
        const salt = bcryptjs.genSaltSync();
        const hashedPassword = bcryptjs.hashSync(user.password, salt);
        user.password = hashedPassword;
      });

      console.log(response.data); 

            // console.log(response.data);

      await prisma.user.createMany({
        data: response.data,
      });

      return res.status(201).json({
        message: "Users successfully seeded",
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
};

export { seedData }
