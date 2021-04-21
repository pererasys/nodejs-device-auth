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
   * @param {UserObject} user
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
   */
  protected signToken = (user: IUserDocument) =>
    new Promise<string>((resolve, reject) => {
      jwt.sign(
        { id: user.id },
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
   * Returns a signed JWT and a device's refresh token
   * @param {IUserDocument} user
   */
  private async getCredentials(user: IUserDocument) {
    return {
      refreshToken: uid(256),
      accessToken: await this.signToken(user),
    };
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
      return this.authenticationSuccess(user, device);
    } else this.throwDefaultAuthenticationError();
  }

  /**
   * Retrieve credentials and update the device auth status
   * @param {IUserDocument} user
   * @param {IDeviceInput} device
   */
  private async authenticationSuccess(
    user: IUserDocument,
    device: IDeviceInput
  ) {
    const credentials = await this.getCredentials(user);

    let registeredDevice = await this.deviceModel.findOne({
      identifier: device.identifier,
    });

    if (!registeredDevice) registeredDevice = new this.deviceModel();

    registeredDevice.platform = device.platform;
    registeredDevice.address = device.address;
    registeredDevice.user = user.id;
    registeredDevice.token = credentials.refreshToken;

    await registeredDevice.save();

    return credentials;
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

      return {
        user: this.transformUser(user),
        credentials: await this.authenticationSuccess(user, device),
      };
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

      const credentials = await this.authenticate(user, password, device);

      return {
        user: this.transformUser(user),
        credentials,
      };
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      else this.throwDefaultAuthenticationError();
    }
  }
}
