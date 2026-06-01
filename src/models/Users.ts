import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document{
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
          username: {
            type: String,
            required: [true, "Please provide a username"],
            unique: true,
            trim: true,
          },
          email:{
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            trim: true,
            lowercase: true,
          },
          password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: [6, "Password must be at least 6 characters"],
          }

    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
export default UserModel