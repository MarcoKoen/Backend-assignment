import { Router } from "express";
const router = Router();

import { getEndpoints } from "../../controllers/v1/endPoints.js";


router.route("/").get(getEndpoints)

export default router;