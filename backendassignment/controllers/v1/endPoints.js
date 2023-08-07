import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import axios from "axios";
import bcryptjs from "bcryptjs";

const getEndpoints = async (req, res) => {
  let endpoint = [
    "REGISTER:",
    "POST /api/v1/auth/register - Register a user",
    "LOGIN:",
    "POST /api/v1/auth/login - Login a user",
    "USER OPTIONS: (depending on permissions)",
    "GET /api/v1/users - Get all users",
    "GET /api/v1/users/:id - Get a user by id",
    "PUT /api/v1/users/:id - Update a user by id",
    "DELETE /api/v1/users/:id - Delete a user by id",
    "QUIZ OPTIONS: (depending on permissions)",
    "GET /api/v1/quiz - Get all quizzes",
    "POST /api/v1/quiz - Create a quiz",
    "DELETE /api/v1/quiz/:id - Delete a quiz by id",
    "POST /api/v1/quiz/:id/play - Play a quiz by id",
    "GET /api/v1/quiz/past - Get all past quizzes",
    "GET /api/v1/quiz/future - Get all future quizzes",
    "GET /api/v1/quiz/present - Get all present quizzes",
    "GET /api/v1/quiz/scores/:id - Get all scores for a quiz by id",
    "SEED OPTIONS",
    "POST /api/v1/quiz/seed_categories - Seed categories",
    "POST /api/v1/quiz/seed - Seed users"
  ];
  return res.status(200).json({
    message: endpoint,
  });
};

export { getEndpoints };
