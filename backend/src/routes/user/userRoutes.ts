import express, { Router } from "express";
import {
  createUserController,
  loginUserController,
  verifyUserController,
  getUserDetailsController,
  deleteUserController,
  logoutUserController,
  updateUserDetailsController,
} from "../../controllers/userController/userController.js";
import {
  validateCreateUser,
  validateLoginUser,
  validateUpdateUser,
} from "../../validations/user/userValidations.js";
import loginLimiter from "../../middlewares/loginLimiter/loginLimiter.js";
import fetchUserData from "../../middlewares/fetchUserData/fetchUserData.js";

const router: Router = express.Router();

// Route for creating a new user
router.post("/create", validateCreateUser(), createUserController);

// Route for verify user email
router.get("/verify-user", verifyUserController);

// Route for login user
router.post("/login", loginLimiter, validateLoginUser(), loginUserController);

// Route for get user details
router.get("/details", fetchUserData, getUserDetailsController);

// Route for delete a user
router.delete("/delete", fetchUserData, deleteUserController);

// Route for logout user
router.get("/logout", fetchUserData, logoutUserController);

// Route for updating user details
router.put(
  "/update-details",
  fetchUserData,
  validateUpdateUser(),
  updateUserDetailsController
);

export default router;
