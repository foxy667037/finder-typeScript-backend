import { body, ValidationChain } from "express-validator";

export const validateUserEmail = (): ValidationChain[] => {
  return [body("email").isEmail().withMessage("Invalid email address")];
};

export const validateCode = (): ValidationChain[] => {
  return [
    body("code").isLength({ min: 6, max: 6 }).withMessage("Invalid code"),
  ];
};

export const validatePassword = (): ValidationChain[] => {
  return [
    body("newPassword")
      .isString()
      .withMessage("Password must be a string")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};
