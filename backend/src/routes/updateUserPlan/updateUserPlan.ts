import express, { Router } from "express";
import fetchUserData from "../../middlewares/fetchUserData/fetchUserData.js";
import { updateUserPlanController } from "../../controllers/updateUserPlanController/updateUserPlanController.js";

const router: Router = express.Router();

router.post("/userPlan", fetchUserData, updateUserPlanController);

export default router;