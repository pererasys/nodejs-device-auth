/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IIPAddress {
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDevice {
  agents: Types.Array<string>;
  hosts: Types.Array<IIPAddressDocument>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeviceDocument extends IDevice, Document {}

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

const DeviceSchema = new Schema(
  {
    agents: {
      type: [String],
      required: true,
    },
    hosts: { type: [IPAddressSchema], required: true },
  },
  { timestamps: true, collection: "devices" }
);

export default mongoose.model<IDeviceDocument>("Device", DeviceSchema);
