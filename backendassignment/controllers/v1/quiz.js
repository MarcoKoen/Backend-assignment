import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import axios from "axios";
import bcryptjs from "bcryptjs";
import Joi from "joi";

import { data } from "../../data/categories.js";

const baseURL = "https://opentdb.com/api.php?amount=10&category=";

const today = new Date();
const formattedToday = formatDate(today);



const createCategories = async (req, res) => {
  await prisma.quiz.deleteMany();
  await prisma.category.deleteMany();
  await prisma.category.createMany({ data });
  const getData = await prisma.category.findMany();
  return res.json({
    msg: "Seed categories successfully",
    data: getData,
  });
};

const createQuiz = async (req, res) => {
  let loggedInUser = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
  });

  const quizSchema = Joi.object({
    categoryId: Joi.number().required().messages({
      "number.base": "Category ID must be a number",
      "number.empty": "Category ID is required",
    }),
    name: Joi.string()
      .min(5)
      .max(30)
      .regex(/^[a-zA-Z]+$/)
      .required()
      .messages({
        "string.base": "Name must be a string",
        "string.empty": "Name is required",
        "string.min": "Name must have a minimum length of {#limit} characters",
        "string.max": "Name must have a maximum length of {#limit} characters",
        "string.pattern.base": "Name must contain only alphabetic characters",
      }),
    type: Joi.string()
      .valid("multiple", "boolean")
      .required()
      .messages({
        "any.only": "Type must be either multiple or boolean",
        "any.required": "Type is required",
      }),
      difficulty: Joi.string()
      .valid("easy", "medium", "hard")
      .required()
      .messages({
        "any.only": "Difficulty must be either easy, medium or hard",
        "any.required": "Difficulty is required",
      }),
      startDate: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required().messages({
      "date.base": "Start date must be a date",
      "date.empty": "Start date is required",
    }),
    endDate: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required().messages({
      "date.base": "End date must be a date",
      "date.empty": "End date is required",
    }),
  });



  if (loggedInUser.role === "SUPER_ADMIN") {
    try {
      const { error } = quizSchema.validate(req.body);
      if (error) {
        const errorMessage = error.details[0].message;
        console.log(error)
        return res.status(400).json({ error: errorMessage });
      }

      const startDateParts = req.body.startDate.split("/");
      const formattedStartDate = `${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`;
      const startDate = new Date(formattedStartDate);

      const dateParts = req.body.endDate.split("/");
      const formattedEndDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      const endDate = new Date(formattedEndDate);

      const todaysDate = new Date().getTime();
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  
      if (startDate < todaysDate) {
        return res.json({
          msg: "Start date cannot be before today's date",
        });
      }
      if (startDate > endDate) {
        return res.json({
          msg: "Start date cannot be greater than end date",
        });
      }
      if (diffDays > 5) {
        return res.json({
          msg: "Quiz duration cannot be longer than five days",
        });
      }

      const response = await axios.get(
        baseURL +
          req.body.categoryId +
          "&difficulty=" +
          req.body.difficulty +
          "&type=" +
          req.body.type
      );

      if (response.data.results.length === 0) {
        return res.status(400).json({
          message: "No questions found for this category",
        });
      }
      console.log(response.data.results);

      await prisma.quiz.create({
        data: {
          categoryId: req.body.categoryId,
          name: req.body.name,
          type: req.body.type,
          difficulty: req.body.difficulty,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          questions: {
            create: response.data.results.map((question) => ({
              question: question.question,
              correctAnswer: question.correct_answer,
              incorrectAnswers: question.incorrect_answers,
            })),
          },
        },
      });

      return res.status(201).json({
        message: "Quiz successfully created",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
};

const deleteQuiz = async (req, res) => {
  const { id } = req.params;

  let loggedInUser = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
  });

  console.log(id);

  if (loggedInUser.role === "SUPER_ADMIN") {
    try {
      await prisma.quiz.delete({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({
        message: "Quiz successfully deleted",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Error deleting quiz",
      });
    }
  }
};

const getAllQuizzes = async (req, res) => {
  return res.status(201).json({
    quiz: await prisma.quiz.findMany(),
    //quizQuestions: await prisma.question.findMany(),
    //userScore: await prisma.userQuestionAnswer.findMany(),
    //userQuizScore: await prisma.userQuizScore.findMany()

  });
};

const getPastQuizzes = async (req, res) => {
  const pastQuizzes = await prisma.quiz.findMany({
    where: {
      endDate: {
        lt: formattedToday,
      },
    },
  });

  return res.status(201).json({
    pastQuizzes,
  });
};

const getListOfScores = async (req, res) => {
  const listOfScores = await prisma.userQuizScore.findMany({
    where: {
      quizId: Number(req.params.id),
    },
  });

  return res.status(201).json({
    listOfScores,
  });
};

 function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}


const getUpcomingQuizzes = async (req, res) => {
  const upcomingQuizzes = await prisma.quiz.findMany({
    where: {
      startDate: {
        gte: formattedToday,
      },
    },
  });
  return res.status(201).json({
    upcomingQuizzes,
  });
};

const getPresentQuizzes = async (req, res) => {
  const presentQuizzes = await prisma.quiz.findMany({
    where: {
      startDate: {
        lte: formattedToday,
      },
      endDate: {
        gte: formattedToday,
      },
    },
  });
  return res.status(201).json({
    presentQuizzes,
  });
};

const playQuiz = async (req, res) => {

  
  const { id } = req.params; // /api/v1/users/1

  const quizToFetch = await prisma.question.findMany({
    where: { quizId: Number(id) },
  });

  const quizForName = await prisma.quiz.findUnique({
    where: { id: Number(id) },
  });

  const currentUser = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
  });

  console.log(req.body);

  const quizSchema = Joi.object({
    answers: Joi.array().max(10).min(10).items(Joi.string().required()).required().messages({
      "any.required": "Please answer all questions",
    }),
    
  });

    try {
      const { error } = quizSchema.validate(req.body);
      if (error) {
        const errorMessage = error.details[0].message;
        console.log(error)
        return res.status(400).json({ error: errorMessage });
      }

  console.log(quizForName)
  const startDateParts = quizForName.startDate.split("/");
      const formattedStartDate = `${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`;
      const startDate = new Date(formattedStartDate);

      const dateParts = quizForName.endDate.split("/");
      const formattedEndDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      const endDate = new Date(formattedEndDate);

      const todaysDate = new Date().getTime();
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (startDate > todaysDate) {
        return res.json({
          msg: "Cannot participate in quiz, the quiz hasn't started yet.",
        });
      }
      if (startDate > endDate) {
        return res.json({
          msg: "Can not participate in the quiz, the quiz has ended sorry.",
        });
      }
      


  const myAnswers = req.body; //

  // Loop and compare
  console.log(myAnswers);
  let score = 0;

  const userQuestionAnswers = myAnswers.map((answer, idx) => {
    if (answer === quizToFetch[idx].correctAnswer) {
      score += 1;
    }
    return {
      userId: req.user.id,
      quizId: Number(id),
      isCorrect: answer === quizToFetch[idx].correctAnswer ? true : false,
      questionId: quizToFetch[idx].id,
      answer: answer,
    };
  });


  await prisma.userQuestionAnswer.createMany({ data: userQuestionAnswers });

  await prisma.userQuizScore.create({
    data: {
      userId: req.user.id,
      quizId: Number(id),
      score: score,
    },
  });

  let averageScore = 0;
   // fetch userquizscore and add them up/ divide by total to get the average score
 const userQuizScore = await prisma.userQuizScore.findMany({
    where: { quizId: Number(id) },
  });
  userQuizScore.forEach((score) => {
    averageScore += score.score;
  });
  averageScore = averageScore / userQuizScore.length;

  return res.status(201).json({
    data: `${currentUser.username} has successfully participated in ${quizForName.name}, your score was ${score}/10, the average score for this quiz is ${averageScore}`,
  });
} catch (error) {
  console.error("Error fetching data:", error);
}
};

export { createQuiz, deleteQuiz, getAllQuizzes, createCategories, playQuiz, getPastQuizzes, getUpcomingQuizzes, getPresentQuizzes, getListOfScores};
