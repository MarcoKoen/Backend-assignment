import { Router } from "express";
const router = Router();

import {
  getInformation,
  updateUser,
  deleteUser
} from "../../controllers/v1/basic.js";

//router.route("/").get(getDepartments).post(createDepartment);
router
  .route("/:id")
  .get(getInformation)
  .put(updateUser)
  .delete(deleteUser);

export default router;