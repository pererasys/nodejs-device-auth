/**
 * @author Andrew Perera
 * Copyright (C) 2020 - All rights reserved
 */

const bcrypt = require("bcrypt");
const decodeJWT = require("jwt-decode");

const { AuthService } = require("../auth");
const { ServiceError, ValidationError } = require("../utils/errors");

const mockConfig = {
  jwtKey: "some_super_secret_key",
  jwtAudience: "audience",
  jwtIssuer: "issuer",
  jwtSubject: "the subject",
  jwtExpiration: "10 minutes",
  refreshCookie: "refresh_token",
};

const service = new AuthService(mockConfig);

test("getDefaultAuthenticationError - should return the default authentication error", () => {
  try {
    service.throwDefaultAuthenticationError();
    throw new Error();
  } catch (err) {
    expect(err instanceof ServiceError).toBe(true);
  }
});

test("signToken - should properly sign a JWT", async () => {
  const token = await service.signToken(mockUser);

  const decoded = decodeJWT(token);

  expect(decoded.id).toEqual(mockUser.id);
  expect(decoded.iss).toEqual(mockConfig.jwtIssuer);
  expect(decoded.sub).toEqual(mockConfig.jwtSubject);
  expect(decoded.aud).toEqual(mockConfig.jwtAudience);
});

describe("validatePassword", () => {
  it("should return hashed password", async () => {
    const password = "ab12cd34";

    const result = await service.validatePassword(password, password);

    const isMatch = await bcrypt.compare(password, result);

    expect(isMatch).toBe(true);
  });

  it("should throw unmatched password error", async () => {
    const password = "ab12cd34";
    const confirmPassword = "ab12";

    return service
      .validatePassword(password, confirmPassword)
      .then(() => {
        throw new Error();
      })
      .catch((e) => {
        expect(e instanceof ValidationError).toBe(true);
        expect(e.invalidArgs).toEqual(["password", "confirmPassword"]);
      });
  });

  it("should throw password sophistication error", async () => {
    const password = "ab12";
    const confirmPassword = "ab12";

    return service
      .validatePassword(password, confirmPassword)
      .then(() => {
        throw new Error();
      })
      .catch((e) => {
        expect(e instanceof ValidationError).toBe(true);
        expect(e.invalidArgs).toEqual(["password", "confirmPassword"]);
      });
  });
});

test("getCredentials - should retreive credentials", async () => {
  const credentials = await service.getCredentials(mockUser);

  expect(typeof credentials.accessToken).toEqual("string");
  expect(typeof credentials.refreshToken).toEqual("string");
});

const mockUser = {
  id: "1",
};
