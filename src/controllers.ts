/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Request, Response } from "express";
import UserModel from "./models/user";

export const createUser = async (req: Request, res: Response) => {
  const user = new UserModel(req.body);

  await user.save();

  return res.status(201).json(user.toObject());
};
