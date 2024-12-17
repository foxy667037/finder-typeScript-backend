import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import ContactForms from "../../models/ContactForm/ContactForm.js";
import { ContactFormType } from "../../models/ContactForm/ContactForm.js";
import UsersBehaviours, {
  UserBehaviourType,
} from "../../models/UsersBehaviour/UsersBehaviour.js";
import Users from "../../models/Users/Users.js";
import formatDateHelper from "../../helpers/getFormatDateHelper/getFormatDateHelper.js";

export const contactFormSendController = async (
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
    const user_id = req.user.id;
    const resultedUser = await Users.findById(user_id);
    const {
      name,
      username,
      email,
      description,
    }: { name: string; username: string; email: string; description: string } =
      req.body;
    const contact_form: ContactFormType = await ContactForms.create({
      user_id: user_id,
      name: name,
      username: username,
      email: email,
      description: description,
    });

    const UserBehaviour: UserBehaviourType = await UsersBehaviours.create({
      user_id: resultedUser?._id,
      username: resultedUser?.username,
      email: resultedUser?.email,
      action: "send contact form",
      action_performed_at: formatDateHelper(),
    });
    if (contact_form || UserBehaviour) {
      res.status(200).json({ Success: "Form Send Successfully" });
      return;
    }
  } catch (err) {
    res.status(500).json({ Error: (err as Error).message });
  } finally {
    next();
  }
};
