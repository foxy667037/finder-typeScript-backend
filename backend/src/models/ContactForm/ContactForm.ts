import mongoose, {
  Document,
  Schema,
  Model,
  StringSchemaDefinition,
} from "mongoose";
import formatDateHelper from "../../helpers/getFormatDateHelper/getFormatDateHelper.js";

export interface ContactFormType extends Document {
  user_id: StringSchemaDefinition;
  name: string;
  username: string;
  email: string;
  description: string;
  send_at: string;
}

const ContactFormSchema: Schema<ContactFormType> = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  description: { type: String, required: true },
  send_at: { type: String, default: formatDateHelper },
});

const ContactForms: Model<ContactFormType> = mongoose.model<ContactFormType>("contactforms", ContactFormSchema);

export default ContactForms;
