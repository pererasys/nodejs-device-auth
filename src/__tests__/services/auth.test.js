const bcrypt = require("bcrypt");
const decodeJWT = require("jwt-decode");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { default: User } = require("../../models/user");
const { default: Device } = require("../../models/device");
const { default: Session } = require("../../models/session");
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
  clientCookie: "client_id",
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

  expect(decoded.account.id).toEqual(mockUserDocument.id);
  expect(decoded.account.username).toEqual(mockUserDocument.username);
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

  afterEach(async () => await clearDatabase());

  it("should retreive credentials", async () => {
    const result = await service.getCredentials(user, mockClientInfo);

    expect(result).toHaveProperty("clientId");
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("session");

    expect(typeof result.clientId).toEqual("string");
    expect(typeof result.accessToken).toEqual("string");
    expect(typeof result.session.token).toEqual("string");
    expect(result.session.expiresAt instanceof Date).toEqual(true);
  });
});

test("register - should register a new user", async () => {
  const result = await service.register(mockUserInput, mockClientInfo);

  expect(result).toHaveProperty("clientId");
  expect(result).toHaveProperty("accessToken");
  expect(result).toHaveProperty("session");

  expect(typeof result.clientId).toEqual("string");
  expect(typeof result.accessToken).toEqual("string");
  expect(typeof result.session.token).toEqual("string");
  expect(result.session.expiresAt instanceof Date).toEqual(true);
});

describe("login", () => {
  beforeEach(async () => {
    const user = new User({
      username: "test_user",
      password: await bcrypt.hash("ab12cd34", 10),
    });

    await user.save();
  });

  afterEach(async () => await clearDatabase());

  it("login - should authenticate a user", async () => {
    const mockUserInput = {
      username: "test_user",
      password: "ab12cd34",
    };

    const result = await service.login(mockUserInput, mockClientInfo);

    expect(result).toHaveProperty("clientId");
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("session");

    expect(typeof result.clientId).toEqual("string");
    expect(typeof result.accessToken).toEqual("string");
    expect(typeof result.session.token).toEqual("string");
    expect(result.session.expiresAt instanceof Date).toEqual(true);
  });
});

describe("refresh", () => {
  let user;
  let device;
  let session;

  beforeEach(async () => {
    user = new User({
      username: "test_user",
      password: await bcrypt.hash("ab12cd34", 10),
    });

    await user.save();

    device = new Device();

    await device.save();

    session = new Session({
      device: device.id,
      user: user.id,
      hosts: [{ address: mockClientInfo.host }],
      agents: [{ raw: mockClientInfo.agent }],
      token: "some_refresh_token",
    });

    await session.save();
  });

  afterEach(async () => await clearDatabase());

  it("refresh - should return a signed JWT", async () => {
    const mockToken = "some_refresh_token";

    const result = await service.refresh(mockToken, {
      ...mockClientInfo,
      id: device.id,
    });

    expect(typeof result).toEqual("string");
  });
});

describe("logout", () => {
  let user;
  let device;
  let session;

  beforeEach(async () => {
    user = new User({
      username: "test_user",
      password: await bcrypt.hash("ab12cd34", 10),
    });

    await user.save();

    device = new Device();

    await device.save();

    session = new Session({
      device: device.id,
      user: user.id,
      hosts: [{ address: mockClientInfo.host }],
      agents: [{ raw: mockClientInfo.agent }],
      token: "some_refresh_token",
    });

    await session.save();
  });

  afterEach(async () => await clearDatabase());

  it("should return success string", async () => {
    const result = await service.logout(user.id, {
      ...mockClientInfo,
      id: device.id,
    });

    expect(typeof result).toEqual("string");
  });
});

const mockUserInput = {
  username: "test_user",
  password: "ab12cd34",
  confirmPassword: "ab12cd34",
};

const mockClientInfo = {
  id: undefined,
  agent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  host: "127.0.0.1",
};

const mockUserDocument = {
  id: "1",
  username: "test_user",
  password: "ab12cd34",
  createdAt: new Date(),
  updatedAt: new Date(),
};
