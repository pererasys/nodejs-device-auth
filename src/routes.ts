/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Router } from "express";

import { login, register, me } from "./controllers";
import { isAuthenticated, isNotAuthenticated } from "./middleware";

export const auth = () => {
  const router = Router();

  router.post("/register", isNotAuthenticated, register);
  router.post("/login", isNotAuthenticated, login);

  return router;
};

export const users = () => {
  const router = Router();

  router.get("/me", isAuthenticated, me);

  return router;
};
