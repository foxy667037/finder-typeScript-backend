import mongoose, { Document, Schema, Model } from "mongoose";

export interface UserBehaviourType extends Document {
  username: string;
  email: string;
  action: string;
  action_performed_at: string;
}

const UserBehaviourSchema: Schema<UserBehaviourType> = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  action: {type:String, enum: ["login", "logout", "update_profile"]},
  action_performed_at: { type: String, required: true, default: null },
});

const UsersBehaviours: Model<UserBehaviourType> =
  mongoose.model<UserBehaviourType>("usersbehaviour", UserBehaviourSchema);

export default UsersBehaviours;