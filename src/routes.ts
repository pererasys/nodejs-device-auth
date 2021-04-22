/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Router } from "express";

import { login, register } from "./controllers";
import { isNotAuthenticated } from "./middleware";

export const auth = () => {
  const router = Router();

  router.post("/register", isNotAuthenticated, register);
  router.post("/login", isNotAuthenticated, login);

  return router;
};
