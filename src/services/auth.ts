/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uid } from "rand-token";

import { Model, Types } from "mongoose";

import User, { IUserDocument, IUserInput } from "../models/user";
import Device, { IDeviceDocument, IDeviceInput } from "../models/device";

import { UserService } from "./users";

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

    rDevice.tokens.push({ token: credentials.refreshToken });

    await rDevice.save();

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
        user: UserService.transformUser(user),
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

      return {
        user: UserService.transformUser(user),
        credentials: await this.authenticate(user, password, device),
      };
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      else this.throwDefaultAuthenticationError();
    }
  }

  /**
   * Logs a user in and returns their credentials
   * @param {IDeviceInput} device
   * @param {string} token
   */
  async refresh(device: IDeviceInput, token: string) {
    try {
      const rDevice = await this.deviceModel
        .findOne({ identifier: device.identifier })
        .populate("user");

      let shouldSaveDevice = false;

      const tokens = rDevice.tokens.filter((t) => t.token === token);

      const error = new ServiceError("Invalid token.", 403);

      if (tokens.length === 0) throw error;

      if (
        rDevice.addresses[rDevice.addresses.length - 1].address !==
        device.address
      ) {
        rDevice.addresses.push({ address: device.address });
        shouldSaveDevice = true;
      }

      let shouldAuthenticate = false;

      tokens.some(async (t) => {
        if (typeof t.revokedAt === "undefined") {
          if (t.expiresAt < new Date()) {
            t.revokedAt = new Date();
            t.revokedReason = "expired";
            shouldSaveDevice = true;

            error.message = "Token expired.";

            return false;
          } else {
            shouldAuthenticate = true;
            return true;
          }
        }
        return false;
      });

      if (shouldSaveDevice) await rDevice.save();

      if (shouldAuthenticate)
        return await this.signToken(rDevice.user as IUserDocument);
      else throw error;
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      else throw new ServiceError();
    }
  }

  /**
   * Logs out a user
   * @param {string} user
   * @param {IDeviceInput} device
   */
  async logout(user: string, device: IDeviceInput) {
    try {
      const rDevice = await this.deviceModel.findOne({
        user: new Types.ObjectId(user),
        identifier: device.identifier,
      });

      if (!rDevice) throw new ServiceError();

      const activeToken = rDevice.tokens[rDevice.tokens.length - 1];

      activeToken.revokedAt = new Date();
      activeToken.revokedReason = "logout";

      await rDevice.save();

      return "Successfully logged out.";
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      else throw new ServiceError();
    }
  }
}
