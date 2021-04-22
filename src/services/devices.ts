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
      identifier: device.identifier,
      platform: device.platform,
      address: device.address,
      loggedIn: device.token !== null,
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
    } catch {
      throw new ServiceError();
    }
  }
}
