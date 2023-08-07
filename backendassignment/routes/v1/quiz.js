import { Router } from "express";
const router = Router();

import {
  createQuiz,
  deleteQuiz,
  getAllQuizzes,
  createCategories,
  playQuiz,
  getPastQuizzes,
  getUpcomingQuizzes,
  getPresentQuizzes,
  getListOfScores
} from "../../controllers/v1/quiz.js";

router.route("/").post(createQuiz).get(getAllQuizzes);

router.route("/seed_categories").post(createCategories);

router.route("/:id").delete(deleteQuiz);

router.route("/:id/play").post(playQuiz);

router.route("/past").get(getPastQuizzes);

router.route("/future").get(getUpcomingQuizzes);

router.route("/present").get(getPresentQuizzes);

router.route("/scores/:id").get(getListOfScores);

export default router;
