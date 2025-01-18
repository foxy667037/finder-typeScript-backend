import { Request, Response, NextFunction } from "express";
import UsersPlans from "../../models/UsersPlans/UsersPlans.js";
import UsersBehaviours, {
  UserBehaviourType,
} from "../../models/UsersBehaviour/UsersBehaviour.js";
import formatDateHelper from "../../helpers/getFormatDateHelper/getFormatDateHelper.js";

export const updateUserPlanController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user_id = req.user.id;
  const plan: string = "Intermediate";
  if (!user_id || !plan) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }
  const resultedUser = await UsersPlans.findOne({ user_id });
  if (resultedUser) {
    if (resultedUser.user_plan === "Basic") {
      try {
        if (plan === "Intermediate") {
          resultedUser.user_free_api_request_limit = 60000;

          resultedUser.user_plan = plan;
          resultedUser.user_paid_api_request_limit = 100000;
          resultedUser.remaining_api_request = 100000;
          resultedUser.currently_user_api_request = 0;

          resultedUser.paidApiLimitResetDate = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          );
          // resultedUser.paidApiLimitResetDate = new Date(Date.now() + 1 * 60 * 1000); // 1 minute for testing only
          resultedUser.paidApiLimitResetDate.setMilliseconds(0);

          const UserBehaviour: UserBehaviourType = new UsersBehaviours({
            user_id: resultedUser._id,
            username: resultedUser.username,
            email: resultedUser.email,
            action: `Plan updated to ${plan}`,
            action_performed_at: formatDateHelper(),
          });

          const savedUserBehaviour = await UserBehaviour.save();
          const savedUser = await resultedUser.save();

          if (savedUserBehaviour || savedUser) {
            res.json({ message: `Plan updated to ${plan}` });
          }
        } else if (plan === "Extreme") {
          resultedUser.user_free_api_request_limit = 60000;

          resultedUser.user_plan = plan;
          resultedUser.user_paid_api_request_limit = 120000;
          resultedUser.remaining_api_request = 120000;
          resultedUser.currently_user_api_request = 0;

          resultedUser.paidApiLimitResetDate = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          );
          // resultedUser.paidApiLimitResetDate = new Date(Date.now() + 1 * 60 * 1000); // 1 minute for testing only
          resultedUser.paidApiLimitResetDate.setMilliseconds(0);

          const UserBehaviour: UserBehaviourType = new UsersBehaviours({
            user_id: resultedUser._id,
            username: resultedUser.username,
            email: resultedUser.email,
            action: `Plan updated to ${plan}`,
            action_performed_at: formatDateHelper(),
          });

          const savedUserBehaviour = await UserBehaviour.save();
          const savedUser = await resultedUser.save();

          if (savedUserBehaviour || savedUser) {
            res.json({ message: `Plan updated to ${plan}` });
          }
        } else {
          res.status(400).json({ message: "Invalid plan selected" });
        }
      } catch (error) {
        console.log(error);
      } finally {
        next();
      }
    } else {
      res
        .status(500)
        .json({ message: "User Already Using Intermidiate Or Advanced Plan." });
      return;
    }
  } else {
    res.status(400).json({ message: "User not found" });
    return;
  }
};
