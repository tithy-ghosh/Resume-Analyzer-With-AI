/**
 * models/Users.ts
 *
 * Mongoose schema for the User collection.
 *
 * Passwords are never stored in plain text — the API route hashes them
 * with bcrypt before calling UserModel.create().
 *
 * The `mongoose.models.User ||` guard prevents "Cannot overwrite model once
 * compiled" errors in Next.js development, where hot-reload re-executes
 * module files without clearing the Mongoose model registry.
 */

import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  username: string
  email: string
  password: string  // bcrypt hash — never the plain-text password
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true, // always store and compare in lowercase
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
)

const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default UserModel