import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Users from "../../models/Users/Users.js";

const fetchUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers["auth-token"] as string;

    if (!token) {
      res.status(401).json({ errors: [{ msg: "Authorization token required!" }] });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET as string;
    if (!jwtSecret) {
      throw new Error("JWT secret key is not defined in environment variables.");
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const user = await Users.findOne({ email: decoded.email }).lean();
    if (!user) {
      res.status(404).json({ errors: [{ msg: "User not found" }] });
      return;
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error: any) {
    console.error("Error in fetchUserData middleware:", error.message);
    res.status(400).json({ errors: [{ msg: "Invalid token or token has expired" }] });
  }
};

export default fetchUserData;