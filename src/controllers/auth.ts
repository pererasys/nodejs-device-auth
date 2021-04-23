/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Request, Response } from "express";
import { IAuthenticatedRequest } from "src/middleware";

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

export const refresh = async (req: Request, res: Response) => {
  try {
    const { token, device } = req.body;

    const service = new AuthService(settings.AUTH);

    const accessToken = await service.refresh(
      {
        ...device,
        address: req.headers.forwarded || req.connection.remoteAddress,
      },
      token
    );

    return res.status(200).json({ accessToken });
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};

export const logout = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const { device } = req.body;

    const service = new AuthService(settings.AUTH);

    const message = await service.logout(req.user.device);

    return res.status(200).json({ message });
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};
