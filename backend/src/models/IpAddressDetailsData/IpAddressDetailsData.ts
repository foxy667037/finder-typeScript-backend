import mongoose, {
  Document,
  Schema,
  Model,
  StringSchemaDefinition,
} from "mongoose";
import moment from "moment-timezone";

const formatDate = () => {
  return moment.tz("Asia/Karachi").format("HH:mm:ss YYYY/MM/DD");
};

export interface IpAddressDetailsDataType extends Document {
  user_id: StringSchemaDefinition;
  username: string;
  email: string;
  searched_ip_data: object;
  created_at: string;
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
    created_at: { type: String, default: formatDate },
  }
);

const IpAddressDetailsData: Model<IpAddressDetailsDataType> =
  mongoose.model<IpAddressDetailsDataType>(
    "usersdata",
    IpAddressDetailsDataSchema
  );

export default IpAddressDetailsData;