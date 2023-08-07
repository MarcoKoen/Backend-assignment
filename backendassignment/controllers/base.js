import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//single ID request
const getTable = async (name, req, res) => {
  try {
    const { id } = req.params;

    const table = await prisma[name].findUnique({
      where: { id: Number(id) },
    });

    if (!table) {
      return res
        .status(200)
        .json({ msg: `No ${name} with the id: ${id} found` });
    }

    return res.json({ data: table });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

//entire table
const getTables = async (name, req, res) => {
  try {
    const table = await prisma[name].findMany();

    if (table.length === 0) {
      return res.status(200).json({ msg: `No ${name} found` });
    }

    return res.json({ data: table });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const createTable = async (table, req, res) => {
  try {
    // const { name, institutionId } = req.body;

    const {id} = req.user;

    await prisma[table].create({
      data: { ...req.body, userId: id}
    });

    const newData = await prisma[table].findMany();

    return res.status(201).json({
      msg: `${table} successfully created`,
      data: newData,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const updateTable = async (table, req, res) => {
  try {
    const { id } = req.params;

    let department = await prisma[table].findUnique({
      where: { id: Number(id) },
    });

    if (!department) {
      return res
        .status(200)
        .json({ msg: `No ${table} with the id: ${id} found` });
    }

    department = await prisma[table].update({
      where: { id: Number(id) },
      data: req.body,
    });

    return res.json({
      msg: `${table} with the id: ${id} successfully updated`,
      data: department,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const deleteEntry = async (table, req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma[table].findUnique({
      where: { id: Number(id) },
    });

    if (!department) {
      return res.status(200).json({ msg: `No entry with the id: ${id} found` });
    }

    await prisma[table].delete({
      where: { id: Number(id) },
    });

    return res.json({
      msg: `Entry with the id: ${id} successfully deleted`,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export { getTable, getTables, createTable, updateTable, deleteEntry };
