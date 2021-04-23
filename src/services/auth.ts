/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uid } from "rand-token";
import { Model } from "mongoose";

import User, { IUserDocument, IUserInput } from "../models/user";
import Device, { IDeviceDocument, IDeviceInput } from "../models/device";

import { ServiceError, ValidationError } from "./utils";

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
  id: string;
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
   * Transforms a user document into an acceptable JSON response
   * @param {IUserDocument} user
   */
  private transformUser(user: IUserDocument) {
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
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
          user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          device: device.id,
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
    device: IDeviceInput
  ) {
    if (await bcrypt.compare(password, user.password)) {
      return await this.getCredentials(user, device);
    } else this.throwDefaultAuthenticationError();
  }

  /**
   * Retrieve credentials and update the device auth status
   * @param {IUserDocument} user
   * @param {IDeviceInput} device
   */
  private async getCredentials(user: IUserDocument, device: IDeviceInput) {
    let rDevice = await this.deviceModel.findOne({
      identifier: device.identifier,
      user: user.id,
    });

    if (!rDevice) {
      const { identifier, platform } = device;

      rDevice = new this.deviceModel({
        identifier,
        platform,
        user: user.id,
      });
    }

    const addressCount = rDevice.addresses.length;

    if (
      addressCount === 0 ||
      rDevice.addresses[addressCount - 1].address !== device.address
    )
      rDevice.addresses.push({ address: device.address });

    const token = uid(256);

    rDevice.tokens.push({ token });

    await rDevice.save();

    return {
      accessToken: await this.signToken(user, rDevice),
      refreshToken: token,
    };
  }

  /**
   * Creates a new user and returns a signed JWT + refresh token
   * @param {IRegistrationInput} data
   * @param {IDeviceInput} device
   */
  async register(data: IRegistrationInput, device: IDeviceInput) {
    try {
      const { username, password, confirmPassword } = data;

      const user = new this.userModel({
        username,
        password: await this.validatePassword(password, confirmPassword),
      });

      await user.save();

      return await this.getCredentials(user, device);
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
   * @param {IDeviceInput} device
   */
  async login(data: IUserInput, device: IDeviceInput) {
    try {
      const { username, password } = data;

      const user = await this.userModel.findOne({ username });

      return await this.authenticate(user, password, device);
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      else this.throwDefaultAuthenticationError();
    }
  }
}
