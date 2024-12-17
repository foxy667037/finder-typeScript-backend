import { body, ValidationChain } from "express-validator";

export const validateContactForm = (): ValidationChain[] => {
  return [
    body("name")
      .isString()
      .withMessage("name must be a string")
      .notEmpty()
      .withMessage("First name is required")
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
    body("description")
      .isString()
      .withMessage("Description must be a string")
      .isLength({ min: 15, max: 300 })
      .withMessage("Description must be at least 150 to 300 characters long"),
  ];
};
