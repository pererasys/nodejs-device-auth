/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import User from "./models/user";
import { authRoutes } from "./routes";

export const buildApp = () => {
  const app = express();

  app.use(bodyParser.json());

  app.use(cookieParser(process.env.COOKIE_SECRET || "some_secret_key"));

  app.use("/auth", authRoutes());

  app.get("/health", async (req, res) => {
    const count = await User.countDocuments();

    return res.status(200).send({ count });
  });

  return app;
};
