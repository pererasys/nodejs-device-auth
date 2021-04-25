/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Router } from "express";

import { login, register, refresh, logout, me } from "./controllers";
import { isAuthenticated, isNotAuthenticated } from "./middleware";

export const auth = () => {
  const router = Router();

  router.post("/register", isNotAuthenticated, register);
  router.post("/login", isNotAuthenticated, login);
  router.post("/refresh", isNotAuthenticated, refresh);
  router.post("/logout", isAuthenticated, logout);

  return router;
};

export const users = () => {
  const router = Router();

  router.get("/me", isAuthenticated, me);

  return router;
};
