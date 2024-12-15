import { body } from "express-validator";

export const validateIpAddress = () => {
  return [
    body("ip")
      .isString()
      .withMessage("Ip must be a string")
      .notEmpty()
  ];
};