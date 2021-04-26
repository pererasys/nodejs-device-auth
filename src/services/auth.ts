/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Model } from "mongoose";

import User, { IUserDocument, IUserInput } from "../models/user";
import Device, { IDeviceDocument } from "../models/device";
import Session, { ISessionDocument } from "../models/session";

import { ServiceError, ValidationError } from "./utils";

import { IClientInfo } from "../middleware";

interface IAuthConfig {
  jwtKey: string;
  jwtAudience: string;
  jwtIssuer: string;
  jwtSubject: string;
  jwtExpiration: string;
}

interface IRegistrationInput extends IUserInput {
  confirmPassword: string;
}

export interface IAuthenticatedUser {
  account: {
    id: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class AuthService {
  config: IAuthConfig;

  deviceModel: Model<IDeviceDocument>;
  userModel: Model<IUserDocument>;
  sessionModel: Model<ISessionDocument>;

  constructor(config: IAuthConfig) {
    this.config = config;

    this.userModel = User;
    this.deviceModel = Device;
    this.sessionModel = Session;
  }

  /**
   * Throws a default authentication exception
   */
  private throwDefaultAuthenticationError() {
    throw new ValidationError(
      "We couldn't log you in with the provided credentials",
      ["username", "password"]
    );
  }

  /**
   * Signs and returns a JWT for the provided user
   * @param {IUserDocument} user
   */
  private signToken = (user: IUserDocument) =>
    new Promise<string>((resolve, reject) => {
      jwt.sign(
        {
          account: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        this.config.jwtKey,
        {
          expiresIn: this.config.jwtExpiration,
          audience: this.config.jwtAudience,
          issuer: this.config.jwtIssuer,
          subject: this.config.jwtSubject,
        },
        (err, token) => {
          if (err) reject(err);
          else resolve(token);
        }
      );
    });

  /**
   * Validates the passwords and
   * returns the hashed result
   * @param {string} password
   * @param {string} confirmPassword
   */
  private async validatePassword(password: string, confirmPassword: string) {
    if (password !== confirmPassword)
      throw new ValidationError("Your passwords must match.", [
        "password",
        "confirmPassword",
      ]);
    if (password.length < 8)
      throw new ValidationError("Passwords must be longer than 8 characters.", [
        "password",
        "confirmPassword",
      ]);

    return await bcrypt.hash(password, 10);
  }

  /**
   * Compares the provided password to the hash stored
   * in the database, and returns new credentials
   * @param {IUserDocument} user
   * @param {string} password
   * @param {IClientInfo} client
   */
  private async authenticate(
    user: IUserDocument,
    password: string,
    client: IClientInfo
  ) {
    if (await bcrypt.compare(password, user.password)) {
      return await this.getCredentials(user, client);
    } else this.throwDefaultAuthenticationError();
  }

  /**
   * Create a new device (if needed) and authentication session,
   * and returns new credentials
   * @param {IUserDocument} user
   * @param {IClientInfo} client
   */
  private async getCredentials(user: IUserDocument, client: IClientInfo) {
    let device: IDeviceDocument;

    if (client.id) device = await this.deviceModel.findById(client.id);
    else device = new this.deviceModel();

    const session = new this.sessionModel({
      user: user.id,
      device: device.id,
      agents: [{ raw: client.agent }],
      hosts: [{ address: client.host }],
    });

    await device.save();
    await session.save();

    return {
      clientId: device.id,
      accessToken: await this.signToken(user),
      refreshToken: session.token,
    };
  }

  /**
   * Creates a new user and returns new credentials
   * @param {IRegistrationInput} data
   * @param {IClientInfo} client
   */
  async register(data: IRegistrationInput, client: IClientInfo) {
    try {
      const { username, password, confirmPassword } = data;

      const user = new this.userModel({
        username,
        password: await this.validatePassword(password, confirmPassword),
      });

      await user.save();

      return await this.getCredentials(user, client);
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      else if (e.code === 11000 && typeof e.keyValue.username !== "undefined") {
        throw new ValidationError("This username is taken.", ["username"]);
      } else throw new ServiceError();
    }
  }

  /**
   * Logs a user in and returns new credentials
   * @param {IUserInput} data
   * @param {IClientInfo} client
   */
  async login(data: IUserInput, client: IClientInfo) {
    try {
      const { username, password } = data;

      const user = await this.userModel.findOne({ username });

      if (user) return await this.authenticate(user, password, client);
      else this.throwDefaultAuthenticationError();
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      else throw new ServiceError();
    }
  }
}
