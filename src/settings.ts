/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

export const PORT = process.env.PORT || 4000;

export const DATABASE = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || "27017",
  name: process.env.DB_NAME || "nodejs-device-auth",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
};
