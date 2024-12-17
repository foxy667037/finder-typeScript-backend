import { Request, Response, NextFunction } from "express";
import UsersBehaviours from "../../models/UsersBehaviour/UsersBehaviour.js";

// Controller to deleted a IP address details
export const deleteUserActivityController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userActivityId = req.query.id;
    if (!userActivityId) {
      res.status(401).json({ msg: "Id is required" });
    }
    const userActivity = await UsersBehaviours.findByIdAndDelete(
      userActivityId
    );
    if (userActivity) {
      res.status(200).json({ msg: "User Activity Deleted Successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  } finally {
    next();
  }
};