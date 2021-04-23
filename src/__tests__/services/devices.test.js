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
      expect(device).toHaveProperty("agent");
      expect(device).toHaveProperty("host");
      expect(device).toHaveProperty("loggedIn");
      expect(device).toHaveProperty("createdAt");
      expect(device).toHaveProperty("updatedAt");
    });
  });
});

const mockDevice = {
  agents: [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  ],
  hosts: [{ address: "127.0.0.1" }],
};
