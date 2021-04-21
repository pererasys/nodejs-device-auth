/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Model } from "mongoose";

import User, { IUserDocument, IUserInput } from "../models/user";
import { ServiceError } from "./utils";

export class UserService {
  model: Model<IUserDocument>;

  constructor() {
    this.model = User;
  }

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
