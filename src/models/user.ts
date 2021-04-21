/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import mongoose, { Schema, Model, Document } from "mongoose";

export interface IUser {
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  username: string;
  password: string;
}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {}

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "users" }
);

export default mongoose.model<IUserDocument>("User", UserSchema);
