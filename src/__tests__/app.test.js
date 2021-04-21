const request = require("supertest");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("./__utils");

const { buildApp } = require("../app");

const app = buildApp();

beforeAll(async () => await buildDatabase());

afterEach(async () => await clearDatabase());

afterAll(async () => await terminateDatabase());

test("should have healthy 200 status", async () => {
  const res = await request(app).get("/health");

  expect(res.statusCode).toEqual(200);
});
