const { Types } = require("mongoose");

const {
  buildDatabase,
  clearDatabase,
  terminateDatabase,
} = require("../__utils");

const { default: User } = require("../../models/user");
const { default: Device } = require("../../models/device");
const { DeviceService } = require("../../services");

beforeAll(async () => await buildDatabase());

afterEach(async () => await clearDatabase());

afterAll(async () => await terminateDatabase());

const service = new DeviceService();

describe("getByUser", () => {
  let userID;

  beforeEach(async () => {
    const user = new User({
      username: "test_user",
      password: "ab12cd34",
    });

    await user.save();

    userID = user.id.toString();

    const device = new Device({
      user: user.id,
      ...mockDevice,
    });

    await device.save();
  });

  it("should return a user JSON response", async () => {
    const result = await service.getByUser(userID);

    expect(result.length).toEqual(1);

    result.forEach((device) => {
      expect(device).toHaveProperty("id");
      expect(device).toHaveProperty("identifier");
      expect(device).toHaveProperty("platform");
      expect(device).toHaveProperty("address");
      expect(device).toHaveProperty("createdAt");
      expect(device).toHaveProperty("updatedAt");
    });
  });
});

const mockDevice = {
  identifier: "1",
  platform: "web",
  address: "127.0.0.1",
};
