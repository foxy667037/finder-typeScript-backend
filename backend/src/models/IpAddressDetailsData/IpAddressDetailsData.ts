import mongoose, {
  Document,
  Schema,
  Model,
  StringSchemaDefinition,
} from "mongoose";
import formatDateHelper from "../../helpers/getFormatDateHelper/getFormatDateHelper.js";

export interface IpAddressDetailsDataType extends Document {
  user_id: StringSchemaDefinition;
  username: string;
  email: string;
  searched_ip_data: object;
  searched_at: string;
}

const IpAddressDetailsDataSchema: Schema<IpAddressDetailsDataType> = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    username: { type: String, required: true },
    email: { type: String, required: true },
    searched_ip_data: { type: Object, required: true },
    searched_at: { type: String, default: formatDateHelper },
  }
);

const IpAddressDetailsData: Model<IpAddressDetailsDataType> =
  mongoose.model<IpAddressDetailsDataType>(
    "usersdata",
    IpAddressDetailsDataSchema
  );

export default IpAddressDetailsData;