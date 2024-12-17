import { Request, Response, NextFunction } from "express";
import Users from "../../models/Users/Users.js";
import jwt from "jsonwebtoken";

const authenticateResetCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token: string | undefined = req.headers["code-token"] as string;

    if (!token || typeof token !== "string") {
      res
        .status(400)
        .json({ errors: [{ msg: "Token is required and must be a string" }] });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret key is not defined");
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, jwtSecret) as {
      email: string;
      code: number;
    };

    // Find the user by email
    const user = await Users.findOne({ email: decoded.email });
    if (!user) {
      res.status(404).json({ errors: [{ msg: "User not found" }] });
      return;
    }

    // Attach user and code details to the request object
    req.user = { id: String(user._id) };
    req.code = decoded.code;

    next(); 
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export default authenticateResetCode;