import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import Users, { UserType } from "../../models/Users/Users.ts";
import verifyJwtTokenHelper from "../../helpers/verifyJwtTokenHelper/verifyJwtTokenHelper.ts";
import IpAddressDetailsData from "../../models/IpAddressDetailsData/IpAddressDetailsData.ts";
import generateRandomStringHelper from "../../helpers/generateRandomStringHelper/generateRandomStringHelper.ts";
import UsersPlans from "../../models/UsersPlans/UsersPlans.ts";
import { UserPlanType } from "../../models/UsersPlans/UsersPlans.ts";
import UsersBehaviours, {
  UserBehaviourType,
} from "../../models/UsersBehaviour/UsersBehaviour.ts";
import formatDateHelper from "../../helpers/getFormatDateHelper/getFormatDateHelper.ts";

dotenv.config();

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
    const USER_LIMIT = 100;

    // Check the current number of users in the database
    const userCount = await Users.countDocuments();

    if (userCount >= USER_LIMIT) {
      res.status(403).json({
        error:
          "User limit reached. Please contact your administrator to increase the user limit.",
      });
      return;
    }

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

    // Generate JWT Token for verifying the account
    const JWT_SECRET = process.env.JWT_SECRET;
    const authToken = jwt.sign({ email: email }, `${JWT_SECRET}`, {
      expiresIn: "60m",
    });

    // Return a success response
    if (savedUser && savedUserPlan) {
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
      user.verified_at = formatDateHelper();
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

      const UserBehaviour: UserBehaviourType = new UsersBehaviours({
        user_id: user._id,
        username: user.username,
        email: user.email,
        action: "login",
        action_performed_at: formatDateHelper(),
      });

      const savedUserBehaviour = await UserBehaviour.save();

      if (savedUserBehaviour) {
        // Respond with the token
        res.status(200).json({
          message: "Login successful",
          authToken: authToken,
        });
        return;
      } else {
        res.status(500).json({ msg: "logout failed" });
        return;
      }
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

// Controller to get user details
export const getUserDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
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

// Controller to delete user & user data
export const deleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

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
    const deleteUserBehaviour = await UsersBehaviours.deleteMany({
      user_id: userId,
    });
    const deleteUserPlan = await UsersPlans.deleteOne({ user_id: userId });

    if (deleteUserData || deleteUserBehaviour || deleteUserPlan) {
      res.status(200).json({
        msg: "User account and associated data deleted successfully",
        deletedRecords: {
          user: deleteUser,
          userData: `${deleteUserData.deletedCount} files deleted successfully`,
        },
      });
    } else {
      res.status(500).json({ msg: "Internal Server Error." });
      return;
    }
  } catch (err) {
    res.status(500).json({ msg: (err as Error).message });
  } finally {
    next();
  }
};

// Controller to logout user
export const logoutUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const resultedUser = await Users.findById({ _id: userId });

    if (!resultedUser) {
      res.status(404).json({ msg: "User Not found" });
      return;
    }

    const UserBehaviour: UserBehaviourType = new UsersBehaviours({
      user_id: resultedUser._id,
      username: resultedUser.username,
      email: resultedUser.email,
      action: "logout",
      action_performed_at: formatDateHelper(),
    });

    const savedUserBehaviour = await UserBehaviour.save();

    if (savedUserBehaviour) {
      res.status(200).json({ msg: "logout successfully" });
      return;
    } else {
      res.status(500).json({ msg: "logout failed" });
      return;
    }
  } catch (err) {
    res.status(500).json({ msg: (err as Error).message });
  } finally {
    next();
  }
};

// Controller for updating user details
export const updateUserDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Extract userId from req.user
    const userId = req.user?.id;
    if (!userId) {
      res.status(404).json({ error: "User Not Found" });
      return;
    }

    let action: string = "";

    // Destructure fields from the request body
    const {
      first_name,
      second_name,
      username,
      email,
      password,
    }: {
      first_name?: string;
      second_name?: string;
      username?: string;
      email?: string;
      password?: string;
    } = req.body;

    // Build a dynamic update object
    const updateData: Partial<{
      first_name: string;
      second_name: string;
      username: string;
      email: string;
      password: string;
    }> = {};

    if (first_name) {
      updateData.first_name = first_name;
      action = "first_name";
    }
    if (second_name) {
      updateData.second_name = second_name;
      action = "second_name";
    }
    if (username) {
      updateData.username = username;
      action = "username";
    }
    if (email) {
      updateData.email = email;
      action = "email";
    }

    // If password is provided, hash it securely
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
      action = "password";
    }

    // Ensure there's at least one field to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields provided for update" });
      return;
    }

    // Find and update the user
    const resultedUser = await Users.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: "-password -secret_token -verifyStatus" }
    );

    if (!resultedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Create and save user behavior log
    const UserBehaviour: UserBehaviourType = new UsersBehaviours({
      user_id: resultedUser._id,
      username: resultedUser.username,
      email: resultedUser.email,
      action: `${action} Updated`,
      action_performed_at: formatDateHelper(),
    });

    await new UsersBehaviours(UserBehaviour).save();

    // Send a success response
    res.status(200).json({
      message: "User updated successfully",
      user: resultedUser,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  } finally {
    next();
  }
};