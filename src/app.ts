/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import expressJwt from "express-jwt";

import User from "./models/user";
import * as routes from "./routes";
import { authErrors, clientInfo } from "./middleware";

import * as settings from "./settings";

const app = express();

app.use(bodyParser.json());

app.use(cookieParser(settings.COOKIE_SECRET));

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

app.get("/health", async (req, res) => {
  const count = await User.countDocuments();

  return res.status(200).send({ count });
});

export default app;
