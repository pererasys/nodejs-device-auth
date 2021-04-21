module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["__utils", "__mocks__"],
  reporters: [
    "default",
    [
      "jest-junit",
      { outputDirectory: "test-results/junit", outputName: "results.xml" },
    ],
  ],
  resetMocks: true,
};
