import { Request, Response, NextFunction } from "express";
import Users from "../../models/Users/Users.ts";

export const authenticateUserAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.query.token;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const user = await Users.findOne({ secret_token: token }).lean();
    if (!user) {
      res.status(404).json({ errors: [{ msg: "User not found" }] });
      return;
    }

    req.user = {
      id: user._id.toString(),
    };

    next();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export default authenticateUserAccessToken;