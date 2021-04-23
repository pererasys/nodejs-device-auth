/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { NextFunction, Request, Response } from "express";

import * as settings from "./settings";

import { IAuthenticatedUser } from "./services";

export const authErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err) {
    if (err.message === "jwt expired")
      res.status(401).send({ error: { message: "Token expired." } });
    else res.status(401).send({ error: { message: "Invalid token." } });
  } else next();
};

export interface IClientInfo {
  id: string;
  host: string;
  agent: string;
}

export type IRequest = Request & {
  client: IClientInfo;
};

export const clientInfo = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  req.client = {
    id: (req.query[settings.AUTH.clientCookie] as string) || null,
    host: req.headers.forwarded || req.connection.remoteAddress,
    agent: req.headers["user-agent"],
  };
  next();
};

export type IAuthenticatedRequest = IRequest & {
  user: IAuthenticatedUser | undefined;
};

export const isAuthenticated = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    res.status(403).json({ message: "Not permitted." });
  } else {
    next();
  }
};

export const isNotAuthenticated = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    res.status(403).json({ message: "Not permitted." });
  } else {
    next();
  }
};
