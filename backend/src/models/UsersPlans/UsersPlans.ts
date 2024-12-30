import mongoose, { Document, Schema, Model } from "mongoose";

export interface UserPlanType extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  username: string;
  email: string;
  secret_token: string;
  user_plan: string;
  user_free_api_request_limit: number;
  user_paid_api_request_limit: number;
  remaining_api_request: number;
  currently_user_api_request: number;
  freeApiLimitResetDate: Date;
  paidApiLimitResetDate: Date | null;
}

const UserPlanSchema: Schema<UserPlanType> = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  username: { 
    type: String, 
    unique: true, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
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
  user_free_api_request_limit: {
    type: Number,
    required: true,
    default: 60000,
  },
  user_paid_api_request_limit: {
    type: Number,
    required: true,
    default: 0,
  },
  remaining_api_request: {
    type: Number,
    required: true,
    default: 60000,
  },
  currently_user_api_request: {
    type: Number,
    required: true,
    default: 0,
  },
  freeApiLimitResetDate: {
    type: Date,
    default: () => {
      const resetDate = new Date();
      resetDate.setMilliseconds(0); 
      resetDate.setTime(resetDate.getTime() + 30 * 24 * 60 * 60 * 1000); 
      return resetDate;
    },
  },
  paidApiLimitResetDate: {
    type: Date || null,
    default: null,
  },
});

const UsersPlans: Model<UserPlanType> = mongoose.model<UserPlanType>(
  "usersplans",
  UserPlanSchema
);

export default UsersPlans;