const bcrypt = require("bcrypt");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { default: app } = require("../../app");

const { default: User } = require("../../models/user");
const { default: Device } = require("../../models/device");
const { default: Session } = require("../../models/session");

const { AUTH } = require("../../settings");

beforeAll(async () => await buildDatabase());

afterEach(async () => await clearDatabase());

afterAll(async () => await terminateDatabase());

describe("login", () => {
  beforeEach(async () => {
    const user = new User({
      ...mockUser,
      password: await bcrypt.hash(mockUser.password, 10),
    });

    await user.save();
  });

  afterEach(async () => await clearDatabase());

  it("should respond with 200", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .set("User-Agent", mockClientInfo.agent)
      .send(mockUser);

    expect(res.statusCode).toEqual(200);
  });

  it("should respond with 400", async () => {
    const body = {
      ...mockUser,
      password: "wrong_password",
    };

    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .set("User-Agent", mockClientInfo.agent)
      .send(body);

    expect(res.statusCode).toEqual(400);
  });
});

describe("register", () => {
  afterEach(async () => await clearDatabase());

  it("should respond with 201", async () => {
    const body = {
      ...mockUser,
      confirmPassword: mockUser.password,
    };

    const res = await request(app)
      .post("/auth/register")
      .set("Content-Type", "application/json")
      .set("User-Agent", mockClientInfo.agent)
      .send(body);

    expect(res.statusCode).toEqual(201);
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

  /**
  it("should respond with 200", async () => {
    const res = await request(app)
      .post(`/auth/refresh?${AUTH.clientCookie}=${device.id}`)
      .set("Content-Type", "application/json")
      .set("User-Agent", mockClientInfo.agent)
      .set("Cookie", [`${AUTH.refreshCookie}=some_refresh_token`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("accessToken");
  });
   */

  it("should respond with 403", async () => {
    const res = await request(app)
      .post(`/auth/refresh?${AUTH.clientCookie}=${device.id}`)
      .set("Content-Type", "application/json")
      .set("User-Agent", mockClientInfo.agent)
      .set("Set-Cookie", [`${AUTH.refreshCookie}=wrong_token`]);

    expect(res.statusCode).toEqual(403);
  });
});

describe("logout", () => {
  let user;
  let device;
  let accessToken;

  beforeEach(async () => {
    user = new User({
      username: "test_user",
      password: await bcrypt.hash("ab12cd34", 10),
    });

    await user.save();

    device = new Device({
      user: user.id,
      agents: [mockClientInfo.agent],
      hosts: [{ address: mockClientInfo.host }],
    });

    await device.save();

    accessToken = jwt.sign({ account: { id: user.id } }, AUTH.jwtKey, {
      audience: AUTH.jwtAudience,
      issuer: AUTH.jwtIssuer,
      subject: AUTH.jwtSubject,
    });
  });

  it("should respond with 200", async () => {
    const res = await request(app)
      .post(`/auth/logout?${AUTH.clientCookie}=${device.id}`)
      .set({
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message");
  });

  it("should respond with 403", async () => {
    const res = await request(app)
      .post(`/auth/logout?${AUTH.clientCookie}=${device.id}`)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toEqual(403);
  });
});

const mockUser = {
  username: "test_user",
  password: "ab12cd34",
};

const mockClientInfo = {
  id: undefined,
  agent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  host: "127.0.0.1",
};
