/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uid } from "rand-token";
import { Model } from "mongoose";

import User, { IUserDocument, IUserInput } from "../models/user";
import Device, { IDeviceDocument } from "../models/device";

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

  constructor(config: IAuthConfig) {
    this.config = config;

    this.userModel = User;
    this.deviceModel = Device;
  }

  /**
   * Returns a default login error response
   */
  private throwDefaultAuthenticationError() {
    throw new ValidationError(
      "We couldn't log you in with the provided credentials",
      ["identifier", "password"]
    );
  }

  /**
   * Signs a JWT for the provided user
   * @param {IUserDocument} user
   * @param {IDeviceDocument} device
   */
  protected signToken = (user: IUserDocument, device: IDeviceDocument) =>
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
   * Validates the provided passwords and
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
   * Authenticates a user and returns a signed JWT
   * @param {IUserDocument} user
   * @param {string} password
   * @param {IDeviceInput} device
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
   * Retrieve credentials and update the device auth status
   * @param {IUserDocument} user
   * @param {IClientInfo} client
   */
  private async getCredentials(user: IUserDocument, client: IClientInfo) {
    let device: IDeviceDocument;

    const token = uid(256);

    if (client.id) {
      device = await this.deviceModel.findById(client.id);

      if (device.agents[device.agents.length - 1] !== client.agent)
        device.agents.push(client.agent);

      if (device.hosts[device.hosts.length - 1].address !== client.host)
        device.hosts.push({ address: client.host });

      device.tokens.push({ token });
    } else {
      device = new this.deviceModel({
        user: user.id,
        agent: client.agent,
        hosts: [{ address: client.host }],
        tokens: [{ token }],
      });
    }

    await device.save();

    return {
      clientID: device.id,
      accessToken: await this.signToken(user, device),
      refreshToken: token,
    };
  }

  /**
   * Creates a new user and returns a signed JWT + refresh token
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
   * Logs a user in and returns their credentials
   * @param {IUserInput} data
   * @param {IClientInfo} client
   */
  async login(data: IUserInput, client: IClientInfo) {
    try {
      const { username, password } = data;

      const user = await this.userModel.findOne({ username });

      return await this.authenticate(user, password, client);
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      else this.throwDefaultAuthenticationError();
    }
  }
}
