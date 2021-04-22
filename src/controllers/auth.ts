/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Request, Response } from "express";

import { AuthService, ServiceError } from "../services";

import * as settings from "../settings";

export const register = async (req: Request, res: Response) => {
  try {
    const service = new AuthService(settings.AUTH);

    const user = req.body.user;

    const device = {
      ...req.body.device,
      address: req.headers.forwarded || req.connection.remoteAddress,
    };

    const result = await service.register(user, device);

    return res.status(201).json(result);
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password, device } = req.body;

    const service = new AuthService(settings.AUTH);

    const result = await service.login(
      { username, password },
      {
        ...device,
        address: req.headers.forwarded || req.connection.remoteAddress,
      }
    );

    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};
