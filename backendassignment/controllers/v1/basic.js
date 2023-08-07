import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getInformation = async (req, res) => {
    try {
      const { id } = req.params; // /api/v1/users/1
  
        // Get logged in users id

        // If logged in users id = 2 and their role is basic user => invalid
        // If logged in users id = 1 and their role is basic user => valid
        // If logged in user and their role is admin user => valid

      const userToFetch = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      const loggedInUser = await prisma.user.findUnique({
        where: { id: Number(req.user.id) },
      });

      if (!userToFetch) {
        return res
          .status(200)
          .json({ msg: `No user with the id: ${id} found` });
      }

      delete userToFetch.password;

      console.log(loggedInUser)
      console.log(userToFetch)


      if (Number(id) === req.user.id && loggedInUser.role === "BASIC")
      {
        return res.status(200).json({ data: userToFetch });
      } else if (loggedInUser.role === "SUPER_ADMIN") {
        return res.status(200).json({ data: userToFetch });
      } else {
        return res.status(200).json({msg: "You do not have permission to access this users information"})
      }

    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };

  const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, username, email} = req.body;
      

      let userToFetch = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      let loggedInUser = await prisma.user.findUnique({
        where: { id: Number(req.user.id) },
      });
  
      
  
      if (!userToFetch) {
        return res
          .status(200)
          .json({ msg: `No user with the id: ${id} found` });
      }
  
      if ((Number(id) === req.user.id && loggedInUser.role === "BASIC") || loggedInUser.role === "SUPER_ADMIN")
      {
          userToFetch = await prisma.user.update({
          where: { id: Number(id) },
          data: { firstName, lastName, username, email },
        });
        return res.json({
          msg: `User - ${userToFetch.firstName} successfully updated`,
          data: userToFetch,
        });
      }
  
      return res.status(200).json({msg: "You do not have permission to access this users information"})
    } catch (err) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  };

  const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToDelete = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    let loggedInUser = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (!userToDelete) {
      return res.status(200).json({ msg: `No user with the id: ${id} found` });
    }

    if(loggedInUser.role === "SUPER_ADMIN" && userToDelete.role === "BASIC") {
      await prisma.user.delete({
      where: { id: Number(id) },
    });
    return res.json({
      msg: `User - ${userToDelete.firstName} successfully deleted`,
    });
    }

    return res.status(200).json({msg: "You do not have permission to access this users information"})
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

  export {
    getInformation,
    updateUser,
    deleteUser,
  }