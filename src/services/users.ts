/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Model } from "mongoose";

import User, { IUserDocument } from "../models/user";
import { ServiceError } from "./utils";

export class UserService {
  model: Model<IUserDocument>;

  constructor() {
    this.model = User;
  }

  /**
   * Transforms a user document into an acceptable JSON response
   * @param {IUserDocument} user
   */
  static transformUser(user: IUserDocument) {
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Returns the user with the given ID
   * @param {string} id
   */
  async getByID(id: string) {
    try {
      const user = await this.model.findById(id);

      if (!user) throw Error();

      return UserService.transformUser(user);
    } catch {
      throw new ServiceError("Not found.", 404);
    }
  }
}
