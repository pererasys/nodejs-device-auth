const bcrypt = require("bcrypt");
const decodeJWT = require("jwt-decode");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { default: User } = require("../../models/user");
const { default: Device } = require("../../models/device");
const {
  AuthService,
  ServiceError,
  ValidationError,
} = require("../../services");

beforeAll(async () => await buildDatabase());

afterEach(async () => await clearDatabase());

afterAll(async () => await terminateDatabase());

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
  const token = await service.signToken(mockUserDocument);

  const decoded = decodeJWT(token);

  expect(decoded.id).toEqual(mockUserDocument.id);
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
  const credentials = await service.getCredentials(mockUserDocument);

  expect(typeof credentials.accessToken).toEqual("string");
  expect(typeof credentials.refreshToken).toEqual("string");
});

test("register - should register a new user", async () => {
  const mockUserInput = {
    username: "test_user",
    password: "ab12cd34",
    confirmPassword: "ab12cd34",
  };

  const mockDeviceInput = {
    identifier: "1",
    platform: "web",
    address: "127.0.0.1",
  };

  const result = await service.register(mockUserInput, mockDeviceInput);

  expect(result.user).toHaveProperty("id");
  expect(result.user).toHaveProperty("createdAt");
  expect(result.user).toHaveProperty("updatedAt");

  expect(result.user.username).toEqual(mockUserInput.username);

  expect(result.credentials).toHaveProperty("accessToken");
  expect(result.credentials).toHaveProperty("refreshToken");
  expect(typeof result.credentials.accessToken).toEqual("string");
  expect(typeof result.credentials.refreshToken).toEqual("string");
});

describe("login", () => {
  beforeEach(async () => {
    const user = new User({
      username: "test_user",
      password: await bcrypt.hash("ab12cd34", 10),
    });

    await user.save();
  });

  it("login - should authenticate a user", async () => {
    const mockUserInput = {
      username: "test_user",
      password: "ab12cd34",
    };

    const mockDeviceInput = {
      identifier: "1",
      platform: "web",
      address: "127.0.0.1",
    };

    const result = await service.login(mockUserInput, mockDeviceInput);

    expect(result.user).toHaveProperty("id");
    expect(result.user).toHaveProperty("createdAt");
    expect(result.user).toHaveProperty("updatedAt");

    expect(result.user.username).toEqual(mockUserInput.username);

    expect(result.credentials).toHaveProperty("accessToken");
    expect(result.credentials).toHaveProperty("refreshToken");
    expect(typeof result.credentials.accessToken).toEqual("string");
    expect(typeof result.credentials.refreshToken).toEqual("string");
  });
});

describe("refresh", () => {
  let user;
  let device;

  beforeEach(async () => {
    user = new User({
      username: "test_user",
      password: await bcrypt.hash("ab12cd34", 10),
    });

    await user.save();

    device = new Device({
      user: user.id,
      identifier: "1",
      platform: "web",
      addresses: [{ address: "127.0.0.1" }],
      tokens: [{ token: "some_refresh_token" }],
    });

    await device.save();
  });

  it("refresh - should return a signed JWT", async () => {
    const mockToken = "some_refresh_token";

    const mockDeviceInput = {
      identifier: "1",
      platform: "web",
      address: "127.0.0.1",
    };

    const result = await service.refresh(mockDeviceInput, mockToken);

    expect(typeof result).toEqual("string");
  });
});

describe("logout", () => {
  let user;
  let device;

  beforeEach(async () => {
    user = new User({
      username: "test_user",
      password: await bcrypt.hash("ab12cd34", 10),
    });

    await user.save();

    device = new Device({
      user: user.id,
      identifier: "1",
      platform: "web",
      addresses: [{ address: "127.0.0.1" }],
      tokens: [{ token: "some_refresh_token" }],
    });

    await device.save();
  });

  it("should return success string", async () => {
    const mockDeviceInput = {
      identifier: "1",
      platform: "web",
      address: "127.0.0.1",
    };

    const result = await service.logout(user.id, mockDeviceInput);

    expect(typeof result).toEqual("string");
  });
});

const mockUserDocument = {
  id: "1",
  username: "test_user",
  password: "ab12cd34",
  createdAt: new Date(),
  updatedAt: new Date(),
};
