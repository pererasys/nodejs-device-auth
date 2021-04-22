const bcrypt = require("bcrypt");
const request = require("supertest");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { buildApp } = require("../../app");

const { default: User } = require("../../models/user");

const app = buildApp();

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
    const body = {
      ...mockUser,
      device: {
        identifier: "1",
        platform: "web",
      },
    };

    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send(body);

    expect(res.statusCode).toEqual(200);
  });

  it("should respond with 400", async () => {
    const body = {
      ...mockUser,
      password: "wrong_password",
      device: {
        identifier: "1",
        platform: "web",
      },
    };

    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send(body);

    expect(res.statusCode).toEqual(400);
  });
});

describe("register", () => {
  afterEach(async () => await clearDatabase());

  it("should respond with 201", async () => {
    const body = {
      user: {
        ...mockUser,
        confirmPassword: mockUser.password,
      },
      device: {
        identifier: "1",
        platform: "web",
      },
    };

    const res = await request(app)
      .post("/auth/register")
      .set("Content-Type", "application/json")
      .send(body);

    expect(res.statusCode).toEqual(201);
  });
});

const mockUser = {
  username: "test_user",
  password: "ab12cd34",
};
