/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import mongoose, { Schema, Model, Document, Types } from "mongoose";

import { IUserDocument } from "./user";

import * as settings from "../settings";

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
  user: Types.ObjectId | IUserDocument;
  agents: Types.Array<string>;
  hosts: Types.Array<IIPAddressDocument>;
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
        date.setDate(date.getDate() + settings.AUTH.refreshExpiration);
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
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agents: {
      type: [String],
      required: true,
    },
    hosts: { type: [IPAddressSchema], required: true },
    tokens: { type: [RefreshTokenSchema], default: [] },
  },
  { timestamps: true, collection: "devices" }
);

export default mongoose.model<IDeviceDocument>("Device", DeviceSchema);
