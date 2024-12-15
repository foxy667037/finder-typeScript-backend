import mongoose, { Document, Schema, Model, StringSchemaDefinition } from "mongoose";

export interface UserPlanType extends Document {
  user_id: StringSchemaDefinition;
  username: string;
  email: string;
  secret_token: string;
  user_plan: string;
  user_api_request_limit: number;
  currently_user_api_request: number;
}

const UserPlanSchema: Schema<UserPlanType> = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  secret_token: {
    type: String,
    required: true,
    unique: true,
  },
  user_plan: {
    type: String,
    required: true,
    default: "Basic",
    enum: ["Basic", "Intermediate", "Advanced"],
  },
  user_api_request_limit: {
    type: Number,
    required: true,
    default: 60000,
  },
  currently_user_api_request: {
    type: Number,
    required: true,
    default: 0,
  },
});

const UsersPlans: Model<UserPlanType> = mongoose.model<UserPlanType>(
  "usersplans",
  UserPlanSchema
);

export default UsersPlans;
