/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import mongoose, { Schema, Model, Document } from "mongoose";

export interface IDevice {
  identifier: string;
  user: Schema.Types.ObjectId;
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
