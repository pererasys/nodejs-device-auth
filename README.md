# NodeJS Device Management w/ Authentication

A NodeJS REST API with basic device management functionality and a persistent authentication strategy using refreshable JSON web tokens.

![Device Management](https://github.com/pererasys/nodejs-device-auth/blob/1-setup/docs/diagram.png?raw=true)

## Setup

**Install Yarn & NPM**

This project uses yarn to manage dependencies, visit the links below for installation instructions.

https://yarnpkg.com/getting-started/install
https://www.npmjs.com/get-npm

**Install Dependencies**

```
yarn install
```

## Development/Testing

**Running the application**

For local development, this project uses Nodemon to take advantage of hot-reloading when files are updated. There is a predefined script to run the server in the Nodemon environment.

```
yarn start:dev
```

**Testing the application**

This project has a number of unit and integration test cases backed by Jest and Supertest. Run the following command to perform all test cases.

```
yarn test
```

## Production

**Building the application (TS -> JS)**

This project uses Typescript, so production builds will be compiled down to standard Javascript. There is a predefined script to lint the code and create a production build.

```
yarn build
```

**Running the application**

After compiling the Typescript source into standard javascript, we can run the server in a production environment with the following command.

```
yarn start
```
