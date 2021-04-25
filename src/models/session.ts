/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { uid } from "rand-token";

import { IDeviceDocument } from "./device";
import { IUserDocument } from "./user";

export interface IUserAgent {
  raw: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIPAddress {
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession {
  user: Types.ObjectId | IUserDocument;
  device: Types.ObjectId | IDeviceDocument;
  agents: Types.Array<IUserAgentDocument>;
  hosts: Types.Array<IIPAddressDocument>;
  token: string;
  revokedReason: "logout" | "expired";
  revokedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIPAddressDocument extends IIPAddress, Document {}

export interface IUserAgentDocument extends IUserAgent, Document {}

export interface ISessionDocument extends ISession, Document {}

export interface ISessionModel extends Model<ISessionDocument> {}

const IPAddressSchema = new Schema(
  {
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const UserAgentSchema = new Schema(
  {
    raw: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const SessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    device: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    agents: {
      type: [UserAgentSchema],
      required: true,
    },
    hosts: {
      type: [IPAddressSchema],
      required: true,
    },
    token: {
      type: String,
      default: () => uid(256),
    },
    expiresAt: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },
    revokedAt: Date,
    revokedReason: {
      type: String,
      enum: ["logout", "expired"],
    },
  },
  { timestamps: true, collection: "auth_sessions" }
);

export default mongoose.model<ISessionDocument>("Session", SessionSchema);
