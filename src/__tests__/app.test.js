const request = require("supertest");

const { buildApp } = require("../app");

const app = buildApp();

beforeAll(() => {});

test("should have healthy 200 status", async () => {
  const res = await request(app).get("/health");

  expect(res.statusCode).toEqual(200);
});
