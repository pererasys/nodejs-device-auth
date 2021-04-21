/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Router } from "express";

import { createUser } from "./controllers";

export const userRoutes = () => {
  const route = Router();

  route.post("/", createUser);
};
