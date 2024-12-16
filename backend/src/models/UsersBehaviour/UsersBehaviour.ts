import mongoose, {
  Document,
  Schema,
  Model,
  StringSchemaDefinition,
} from "mongoose";

export interface UserBehaviourType extends Document {
  user_id: StringSchemaDefinition;
  username: string;
  email: string;
  action: string;
  action_performed_at: string;
}

const UserBehaviourSchema: Schema<UserBehaviourType> = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  username: { type: String, required: true },
  email: { type: String, required: true },
  action: { type: String},
  action_performed_at: { type: String, required: true, default: null },
});

const UsersBehaviours: Model<UserBehaviourType> =
  mongoose.model<UserBehaviourType>("usersbehaviour", UserBehaviourSchema);

export default UsersBehaviours;
