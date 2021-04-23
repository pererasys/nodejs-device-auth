/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Model, Types } from "mongoose";

import Device, { IDeviceDocument } from "../models/device";
import { ServiceError } from "./utils";

export class DeviceService {
  model: Model<IDeviceDocument>;

  constructor() {
    this.model = Device;
  }

  /**
   * Transforms a device document into an acceptable JSON response
   * @param {IDeviceDocument} device
   */
  static transformDevice(device: IDeviceDocument) {
    return {
      id: device.id,
      agent: device.agents[device.agents.length - 1],
      host: device.hosts[device.hosts.length - 1].address,
      loggedIn:
        device.tokens.length > 0
          ? !device.tokens[device.tokens.length - 1].revokedAt
          : false,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    };
  }

  /**
   * Returns all active devices associated with the user
   * @param {string} user
   */
  async getByUser(user: string) {
    try {
      const devices = await this.model.find({
        user: new Types.ObjectId(user),
      });

      return devices.map(DeviceService.transformDevice);
    } catch (e) {
      console.log(e);
      throw new ServiceError();
    }
  }
}
