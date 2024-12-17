import { body, ValidationChain } from "express-validator";

export const validateIpAddress = (): ValidationChain[] => {
  return [body("ip").isString().withMessage("Ip must be a string").notEmpty()];
};
