const bcrypt = require("bcrypt");
const request = require("supertest");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { default: app } = require("../../app");

const { default: User } = require("../../models/user");

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
