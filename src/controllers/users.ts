/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { Response } from "express";

import { DeviceService, ServiceError, UserService } from "../services";

import { IAuthenticatedRequest } from "../middleware";

export const me = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const service = new UserService();

    const result = await service.getByID(req.user.id);

    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};

export const devices = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const service = new DeviceService();

    const result = await service.getByUser(req.user.id);

    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof ServiceError) return res.status(e.status).json(e);
    return res.status(500).json(new ServiceError());
  }
};
