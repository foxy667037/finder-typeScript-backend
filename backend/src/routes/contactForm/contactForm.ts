import express, { Router } from "express";
import { validateContactForm } from "../../validations/contactForm/contactFormValidations.js";
import fetchUserData from "../../middlewares/fetchUserData/fetchUserData.js";
import { contactFormSendController } from "../../controllers/contactFormController/contactFormController.js";

const router: Router = express.Router();

// router for request a code:
router.post("/send-form", fetchUserData, validateContactForm(), contactFormSendController);

export default router;