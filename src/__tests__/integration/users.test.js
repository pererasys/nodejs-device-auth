const request = require("supertest");
const jwt = require("jsonwebtoken");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { buildApp } = require("../../app");

const { default: User } = require("../../models/user");

const { AUTH } = require("../../settings");

const app = buildApp();

beforeAll(async () => await buildDatabase());

afterEach(async () => await clearDatabase());

afterAll(async () => await terminateDatabase());

describe("me", () => {
  let accessToken;

  beforeEach(async () => {
    const user = new User(mockUser);
    await user.save();

    accessToken = jwt.sign({ account: { id: user.id } }, AUTH.jwtKey, {
      audience: AUTH.jwtAudience,
      issuer: AUTH.jwtIssuer,
      subject: AUTH.jwtSubject,
    });
  });

  afterEach(async () => await clearDatabase());

  it("should respond with 200", async () => {
    const res = await request(app)
      .get("/users/me")
      .set({
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.username).toEqual(mockUser.username);
  });

  it("should respond with 403", async () => {
    const res = await request(app).get("/users/me").set({
      "Content-Type": "application/json",
    });

    expect(res.statusCode).toEqual(403);
  });
});

const mockUser = {
  username: "test_user",
  password: "ab12cd34",
};
