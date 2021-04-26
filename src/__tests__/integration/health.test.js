const request = require("supertest");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { default: app } = require("../../app");

beforeAll(async () => await buildDatabase());

afterEach(async () => await clearDatabase());

afterAll(async () => await terminateDatabase());

test("should have healthy 200 status", async () => {
  const res = await request(app).get("/sessions");

  expect(res.statusCode).toEqual(200);
});
