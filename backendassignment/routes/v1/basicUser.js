import { Router } from "express";
const router = Router();

import { seedData } from "../../controllers/v1/basicUser.js";


router.route("/").post(seedData)

export default router;