/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import mongoose, { Schema, Model, Document, Types } from "mongoose";

import { IUserDocument } from "./user";

export interface IDevice {
  identifier: string;
  user: Types.ObjectId | IUserDocument;
  platform: "ios" | "android" | "web";
  address: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeviceInput {
  identifier: string;
  platform: "ios" | "android" | "web";
  address: string;
}

export interface IDeviceDocument extends IDevice, Document {}

export interface IDeviceModel extends Model<IDeviceDocument> {}

const DeviceSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["web", "ios", "android"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: true,
      index: true,
    },
    token: String,
  },
  { timestamps: true, collection: "devices" }
);

export default mongoose.model<IDeviceDocument>("Device", DeviceSchema);
