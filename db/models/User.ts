import mongoose, { Document, Schema, Types, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  boards: Types.ObjectId[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  boards: [{ type: Schema.Types.ObjectId, ref: "Board" }],
  createdAt: { type: Date, default: Date.now },
});

// UserSchema.index({ email: 1 }, { unique: true }); // Login/authentication - email lookup
UserSchema.index({ name: 1 }); // Search users by name
UserSchema.index({ boards: 1 }); // Find users who have access to specific boards

export default mongoose.models.User || model<IUser>("User", UserSchema);
