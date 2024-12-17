import express, { Router } from "express";
import fetchUserData from "../../middlewares/fetchUserData/fetchUserData.js";
import { deleteUserActivityController } from "../../controllers/userActivityController/userActivityController.js";

const router: Router = express.Router();

// Route for delete a user Activity
router.delete("/delete", fetchUserData, deleteUserActivityController);

export default router;
