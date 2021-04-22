const { Types } = require("mongoose");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { default: User } = require("../../models/user");
const { UserService } = require("../../services");

beforeAll(async () => await buildDatabase());

afterEach(async () => await clearDatabase());

afterAll(async () => await terminateDatabase());

const service = new UserService();

describe("getById", () => {
  let userID;

  beforeEach(async () => {
    const user = new User({
      username: "test_user",
      password: "ab12cd34",
    });

    await user.save();

    userID = user.id.toString();
  });

  it("should return a user JSON response", async () => {
    const result = await service.getByID(userID);

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("username");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });
});
