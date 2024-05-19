// eslint-disable-next-line no-undef
module.exports = {
  moduleNameMapper: {
    "\\.(png|jpg|ico|jpeg|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__mocks__/ImageMock.js",
  },
  testPathIgnorePatterns: ["./src/app/js/__tests__/test-data.js"],
};
