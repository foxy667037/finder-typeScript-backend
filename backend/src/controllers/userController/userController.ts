import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import Users, { UserType } from "../../models/Users/Users.js";
import verifyJwtTokenHelper from "../../helpers/verifyJwtTokenHelper/verifyJwtTokenHelper.js";
import IpAddressDetailsData from "../../models/IpAddressDetailsData/IpAddressDetailsData.js";
import generateRandomStringHelper from "../../helpers/generateRandomStringHelper/generateRandomStringHelper.js";
import UsersPlans from "../../models/UsersPlans/UsersPlans.js";
import { UserPlanType } from "../../models/UsersPlans/UsersPlans.js";

dotenv.config();

const formatDate = () => {
  return moment.tz("Asia/Karachi").format("HH:mm:ss YYYY/MM/DD");
};

// Controller to create the user
export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { first_name, second_name, username, email, password }: UserType =
      req.body;

    // Check if a user with the same username or email already exists
    const existingEmail = await Users.findOne({ email });
    const existingUsername = await Users.findOne({ username });

    if (existingEmail || existingUsername) {
      res.status(400).json({ error: "Username or email already exists" });
      return;
    }

    // Hash the password
    let hashedPassword: string | null = null;

    if (password) {
      const saltRounds: number = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } else {
      throw new Error("Password cannot be null or undefined");
    }

    // Create a new user instance
    const newUser: UserType = new Users({
      first_name,
      second_name,
      username,
      email,
      password: hashedPassword,
      secret_token: generateRandomStringHelper,
      SignInWith: "Email Account",
    });

    // Create a new user plan instance
    const newUserPlan: UserPlanType = new UsersPlans({
      user_id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      secret_token: newUser.secret_token,
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    const savedUserPlan = await newUserPlan.save();

    // generate JWT Token for verify account
    const JWT_SECRET = process.env.JWT_SECRET;
    const authToken = jwt.sign({ email: email }, `${JWT_SECRET}`, {
      expiresIn: "60m",
    });

    // Return a success response
    if (savedUser || savedUserPlan) {
      res.status(201).json({
        message: "User created successfully",
        verifyToken: authToken,
      });
    } else {
      res.status(500).json({ msg: "Internal Server Error" });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  } finally {
    next();
  }
};

// Controller to verify the user
export const verifyUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = typeof req.query.token === "string" ? req.query.token : null; // Get token from the URL parameter

    // check token is missing or invalid
    if (!token) {
      res.status(400).json({ error: "Token is missing or invalid" });
    }

    const decoded = await verifyJwtTokenHelper(String(token));

    const user = await Users.findOne({ email: decoded.email }).select(
      "-password"
    );

    // If the user is not found
    if (!user) {
      res
        .status(404)
        .json({ message: "User not found or verification failed" });
      return;
    }

    if (user.verifyStatus === "pending") {
      user.verifyStatus = "verified";
      user.verified_at = formatDate();
      await user.save();
    } else {
      res.status(500).json({ message: "User already verified" });
    }
    res.status(200).json({ message: "User successfully verified" });
  } catch (err) {
    res.status(500).json({ Error: (err as Error).message });
  } finally {
    next();
  }
};

// Controller to login the user
export const loginUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { email, password }: { email: string; password: string } = req.body;

    // Find user by email
    const user = await Users.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "User Not Found" });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (user.verifyStatus === "verified") {
      // Generate JWT token for login account
      const JWT_SECRET = process.env.JWT_SECRET;
      const authToken = jwt.sign({ email: user.email }, `${JWT_SECRET}`);

      // Respond with the token
      res.status(200).json({
        message: "Login successful",
        authToken: authToken,
      });
    } else {
      // generate JWT Token for verify account
      const JWT_SECRET = process.env.JWT_SECRET;
      const verifyToken = jwt.sign({ email: email }, `${JWT_SECRET}`, {
        expiresIn: "60m",
      });
      res.status(401).json({
        message: "Please verify this account",
        verifyToken: verifyToken,
      });
      return;
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  } finally {
    next();
  }
};

// controller to get user details
export const getUserDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user.id;
    console.log(userId);

    const user = await Users.findById(userId).select("-password");
    console.log(user);

    if (!user) {
      res.status(401).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error });
  } finally {
    next();
  }
};

// controller to delete user & user data
export const deleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user.id;

    // Find and Delete the user by ID
    const deleteUser = await Users.findByIdAndDelete(userId);

    // Check if user exists before proceeding
    if (!deleteUser) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    // Find and delete all user-related data
    const deleteUserData = await IpAddressDetailsData.deleteMany({
      user_id: userId,
    });

    res.status(200).json({
      msg: "User account and associated data deleted successfully",
      deletedRecords: {
        user: deleteUser,
        userData: `${deleteUserData.deletedCount} files deleted successfully`,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: (err as Error).message });
  } finally {
    next();
  }
};