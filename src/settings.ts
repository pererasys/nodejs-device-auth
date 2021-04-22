/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

export const AUTH = {
  jwtKey: process.env.JWT_KEY || "test_key",
  jwtAudience: process.env.JWT_AUDIENCE || "nodejs-device-auth",
  jwtIssuer: process.env.JWT_ISSUER || "http://localhost:4000",
  jwtSubject: process.env.JWT_SUBJECT || "Device management API",
  jwtExpiration: process.env.JWT_EXPIRATION || "15 minutes",
  refreshCookie: process.env.REFRESH_COOKIE || "device_token",
  refreshExpiration: parseInt(process.env.REFRESH_EXPIRATION, 10) || 30,
};

export const HTTPS_ONLY = Boolean(process.env.HTTPS_ONLY);

export const COOKIE_SECRET = process.env.COOKIE_SECRET || "some_secret_key";

export const PORT = process.env.PORT || 4000;

export const DATABASE = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || "27017",
  name: process.env.DB_NAME || "nodejs-device-auth",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
};
