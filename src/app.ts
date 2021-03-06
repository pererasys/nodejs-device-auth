/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import expressJwt from "express-jwt";
import helmet from "helmet";

import * as routes from "./routes";
import { authErrors, clientInfo } from "./middleware";

import Session from "./models/session";
import { ServiceError } from "./services";

import * as settings from "./settings";

const app = express();

app.use(helmet());

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

app.use("/users", routes.users());

app.get("/sessions", async (req, res) => {
  try {
    return res.status(200).send({ sessions: await Session.find() });
  } catch {
    return res.status(500).json(new ServiceError());
  }
});

export default app;
