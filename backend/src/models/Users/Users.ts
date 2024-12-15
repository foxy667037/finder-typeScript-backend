import mongoose, { Document, Schema, Model } from "mongoose";
import moment from "moment-timezone";

const formatDate = () => {
  return moment.tz("Asia/Karachi").format("HH:mm:ss YYYY/MM/DD");
};

export interface UserType extends Document {
  googleId?: string | null;
  photoURL?: string;
  first_name: string;
  second_name: string;
  username: string;
  email: string;
  password: string | null;
  secret_token: string;
  SignInWith: string;
  verifyStatus: string;
  created_at: string;
  verified_at?: string;
}

const UserSchema: Schema<UserType> = new Schema({
  googleId: { type: String, default: null },
  photoURL: { type: String, required: false, default: null },
  first_name: { type: String, required: true },
  second_name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, default: null },
  secret_token: {
    type: String,
    required: true,
    unique: true,
    default: null,
  },
  SignInWith: { type: String, default: "null" },
  verifyStatus: { type: String, default: "pending" },
  created_at: { type: String, default: formatDate },
  verified_at: { type: String, default: null },
});

const Users: Model<UserType> = mongoose.model<UserType>("users", UserSchema);

export default Users;