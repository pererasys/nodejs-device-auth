/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import mongoose, { Schema, Model, Document } from "mongoose";
import { uid } from "rand-token";

export interface IRefreshToken {
  user: Schema.Types.ObjectId;
  device: Schema.Types.ObjectId;
  token: string;
  revokedReason: "logout" | "expired";
  revokedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document {}

export interface IRefreshTokenModel extends Model<IRefreshTokenDocument> {}

const RefreshTokenSchema = new Schema(
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
  { timestamps: true, collection: "refresh_tokens" }
);

export default mongoose.model<IRefreshTokenDocument>(
  "RefreshToken",
  RefreshTokenSchema
);
