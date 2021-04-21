/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Router } from "express";

import { login, register } from "./controllers";

export const authRoutes = () => {
  const router = Router();

  router.post("/register", register);
  router.post("/login", login);

  return router;
};
