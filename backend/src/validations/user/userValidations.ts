import { body } from "express-validator";

export const validateCreateUser = () => {
  return [
    body("first_name")
      .isString()
      .withMessage("First name must be a string")
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 3, max: 40 })
      .withMessage(
        "first name atleast contain 3 characters and max 40 characters"
      ),
    body("second_name")
      .isString()
      .withMessage("Second name must be a string")
      .notEmpty()
      .withMessage("Second name is required")
      .isLength({ min: 3, max: 40 })
      .withMessage(
        "first name atleast contain 3 characters and max 40 characters"
      ),
    body("username")
      .isString()
      .withMessage("Username must be a string")
      .notEmpty()
      .withMessage("Username is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isString()
      .withMessage("Password must be a string")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};

export const validateLoginUser = () => {
  return [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isString()
      .withMessage("Password must be a string")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};
