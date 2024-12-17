import { Request, Response, NextFunction } from "express";
import Users from "../../models/Users/Users.ts";
import generateRandomCode from "../../helpers/generateRandomCodeHelper/generateRandomCodeHelper.ts";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// firstly false after code verified it true, set password then it again set false for security, ensure that the code work only one time.
let verificationStatus: boolean = false;

export const requestCodeController = async (
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
    const { email }: { email: string } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    // Generate code
    const code = await generateRandomCode();

    // Generate JWT Token for verifying the code
    const JWT_SECRET = process.env.JWT_SECRET;
    const verificationToken = jwt.sign(
      { code, email, verified: false },
      JWT_SECRET!,
      { expiresIn: "60m" }
    );

    res.status(200).json({
      msg: "Code sent successfully",
      Token: verificationToken,
      Verification_Code: code,
    });
  } catch (err) {
    res.status(500).json({ Error: (err as Error).message });
    return;
  } finally {
    next();
  }
};

export const verifyCodeController = async (
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
    const { code }: { code: number } = req.body;
    const originalCode = req.code;
    const user = req.user;

    if (!originalCode || !user) {
      res.status(400).json({ msg: "Invalid request. Missing user or code." });
      return;
    }

    if (code === originalCode) {
      verificationStatus = true;
      res.status(200).json({ msg: "Code verified successfully!" });
    } else {
      res.status(400).json({ msg: "Invalid code. Please try again." });
      return;
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
    return;
  } finally {
    next();
  }
};

export const resetPasswordController = async (
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
    const { newPassword }: { newPassword: string } = req.body;
    const userId = req.user?.id;

    if (verificationStatus) {
      const user = await Users.findById(userId);
      if (!user) {
        res.status(404).json({ msg: "User not found" });
        return;
      }

      let hashedPassword: string | null = null;
      if (newPassword) {
        const saltRounds: number = 10;
        hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      } else {
        throw new Error("Password cannot be null or undefined");
      }

      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ msg: "Password reset successfully!" });
      verificationStatus = false;
      return;
    } else {
      res.status(400).json({ msg: "Code Expired or Used. Please request a new Code." });
      return;
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  } finally {
    next();
  }
};