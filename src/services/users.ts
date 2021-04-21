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
   * Returns the user with the given ID
   * @param {string} id
   */
  async getByID(id: string) {
    try {
      const user = this.model.findById(id);

      if (!user) throw Error();

      return user;
    } catch {
      throw new ServiceError("Not found.", 404);
    }
  }
}
