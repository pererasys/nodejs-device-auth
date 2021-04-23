/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Response } from "express";

import { AuthService, ServiceError } from "../services";

import * as settings from "../settings";

import { IRequest } from "../middleware";

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
