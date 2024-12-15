import express, { Router } from "express";
import {getIpAddressDetailsController, getIpAddressController, deleteIpAddresssDetailsDataController, externalIpAddressController} from "../../controllers/getIpController/getIpController.js";
import fetchUserData from "../../middlewares/fetchUserData/fetchUserData.js";
import authenticateUserAccessToken from "../../middlewares/authenticateUserAccessToken/authenticateUserAccessToken.js";
import { validateIpAddress } from "../../validations/ipAddress/ipAddressValidations.js";
const router: Router = express.Router();

// route for getting currently user ip
router.get("/ipAddress", getIpAddressController);

// route for getting ip address details
router.post("/details", validateIpAddress(), fetchUserData, getIpAddressDetailsController);

// route for delete searched ip record
router.delete("/deleteipdata", fetchUserData, deleteIpAddresssDetailsDataController);

// route for get details of external ip
router.get("/finder/:ip", authenticateUserAccessToken, externalIpAddressController);

export default router;