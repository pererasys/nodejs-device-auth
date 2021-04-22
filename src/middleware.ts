/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { NextFunction, Request, Response } from "express";

import { IAuthenticatedUser } from "./services";

export const authErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err) {
    console.log(err);
    if (err.message === "jwt expired")
      res.status(401).send({ error: { message: "Token expired." } });
    else res.status(401).send({ error: { message: "Invalid token." } });
  } else next();
};

export type IAuthenticatedRequest = Request & {
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
