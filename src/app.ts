/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import express from "express";
import User from "./models/user";

export const buildApp = () => {
  const app = express();

  app.get("/health", async (req, res) => {
    const count = await User.count();

    return res.status(200).send({ count });
  });

  return app;
};
