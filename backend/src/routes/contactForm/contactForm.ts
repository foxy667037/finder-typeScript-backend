import express, { Router } from "express";
import { validateContactForm } from "../../validations/contactForm/contactFormValidations.ts";
import fetchUserData from "../../middlewares/fetchUserData/fetchUserData.ts";
import { contactFormSendController } from "../../controllers/contactFormController/contactFormController.ts";

const router: Router = express.Router();

// router for request a code:
router.post("/send-form", fetchUserData, validateContactForm(), contactFormSendController);

export default router;