/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import mongoose, { Schema, Model, Document, Types } from "mongoose";

import { IUserDocument } from "./user";

export interface IRefreshToken {
  token: string;
  revokedReason: "logout" | "expired";
  revokedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIPAddress {
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDevice {
  identifier: string;
  user: Types.ObjectId | IUserDocument;
  platform: "ios" | "android" | "web";
  addresses: Types.Array<IIPAddressDocument>;
  tokens: Types.Array<IRefreshTokenDocument>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeviceInput {
  identifier: string;
  platform: "ios" | "android" | "web";
  address: string;
}

export interface IDeviceDocument extends IDevice, Document {}

export interface IRefreshTokenDocument extends IRefreshToken, Document {}

export interface IIPAddressDocument extends IIPAddress, Document {}

export interface IDeviceModel extends Model<IDeviceDocument> {}

const IPAddressSchema = new Schema(
  {
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const RefreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date();
        date.setMilliseconds(date.getMilliseconds() + 30);
        return date;
      },
    },
    revokedAt: Date,
    revokedReason: {
      type: String,
      enum: ["logout", "expired"],
    },
  },
  { timestamps: true }
);

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
    addresses: { type: [IPAddressSchema], default: [] },
    tokens: { type: [RefreshTokenSchema], default: [] },
  },
  { timestamps: true, collection: "devices" }
);

export default mongoose.model<IDeviceDocument>("Device", DeviceSchema);
