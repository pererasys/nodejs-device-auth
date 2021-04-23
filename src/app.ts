/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import expressJwt from "express-jwt";

import User from "./models/user";
import { ServiceError } from "./services";

import * as routes from "./routes";
import { authErrors, clientInfo } from "./middleware";

import * as settings from "./settings";

export const buildApp = () => {
  const app = express();

  app.use(bodyParser.json());

  app.use(cookieParser(process.env.COOKIE_SECRET || "some_secret_key"));

  app.use(clientInfo);

  app.use(
    expressJwt({
      secret: settings.AUTH.jwtKey,
      issuer: settings.AUTH.jwtIssuer,
      audience: settings.AUTH.jwtAudience,
      algorithms: ["HS256"],
      credentialsRequired: false,
    })
  );

  app.use(authErrors);

  app.use("/auth", routes.auth());

  app.use("/users", routes.users());

  app.get("/health", async (req, res) => {
    try {
      const count = await User.countDocuments();

      return res.status(200).json({ count });
    } catch {
      return res.status(500).json(new ServiceError());
    }
  });

  return app;
};
