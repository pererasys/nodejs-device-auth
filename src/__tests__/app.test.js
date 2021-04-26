const request = require("supertest");

const { default: app } = require("../app");

beforeAll(() => {});

test("should have 200 status", async () => {
  const res = await request(app).get("/");

  expect(res.statusCode).toEqual(200);
});
