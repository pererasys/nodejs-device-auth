const bcrypt = require("bcrypt");
const decodeJWT = require("jwt-decode");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { default: User } = require("../../models/user");
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
  const token = await service.signToken(mockUserDocument, mockDeviceDocument);

  const decoded = decodeJWT(token);

  expect(decoded.account.id).toEqual(mockUserDocument.id);
  expect(decoded.account.username).toEqual(mockUserDocument.username);
  expect(decoded.device).toEqual(mockDeviceDocument.id);
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

describe("getCredentials", () => {
  let user;

  beforeEach(async () => {
    user = new User({
      username: "test_user",
      password: await bcrypt.hash("ab12cd34", 10),
    });

    await user.save();
  });

  it("should retreive credentials", async () => {
    const credentials = await service.getCredentials(user, mockDeviceInput);

    expect(typeof credentials.accessToken).toEqual("string");
    expect(typeof credentials.refreshToken).toEqual("string");
  });
});

test("register - should register a new user", async () => {
  const result = await service.register(mockUserInput, mockDeviceInput);

  expect(result).toHaveProperty("accessToken");
  expect(result).toHaveProperty("refreshToken");
  expect(typeof result.accessToken).toEqual("string");
  expect(typeof result.refreshToken).toEqual("string");
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

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(typeof result.accessToken).toEqual("string");
    expect(typeof result.refreshToken).toEqual("string");
  });
});

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

const mockDeviceDocument = {
  id: "1",
  identifier: "1",
  platform: "ios",
  tokens: [],
  addresses: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserDocument = {
  id: "1",
  username: "test_user",
  password: "ab12cd34",
  createdAt: new Date(),
  updatedAt: new Date(),
};
