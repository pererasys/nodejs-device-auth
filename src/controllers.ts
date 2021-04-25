/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Response } from "express";

import { AuthService, UserService, ServiceError } from "./services";

import * as settings from "./settings";

import { IRequest, IAuthenticatedRequest } from "./middleware";

export const register = async (req: IRequest, res: Response) => {
  try {
    const service = new AuthService(settings.AUTH);

    const result = await service.register(req.body, req.client);

    return res.status(201).json(result);
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};

export const login = async (req: IRequest, res: Response) => {
  try {
    const service = new AuthService(settings.AUTH);

    const result = await service.login(req.body, req.client);

    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};

export const refresh = async (req: IRequest, res: Response) => {
  try {
    const service = new AuthService(settings.AUTH);

    const accessToken = await service.refresh(
      req.query[settings.AUTH.refreshCookie] as string,
      req.client
    );

    return res.status(200).json({ accessToken });
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};

export const logout = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const service = new AuthService(settings.AUTH);

    const message = await service.logout(req.user.account.id, req.client);

    return res.status(200).json({ message });
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};

export const me = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const service = new UserService();

    const result = await service.getByID(req.user.account.id);

    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};
