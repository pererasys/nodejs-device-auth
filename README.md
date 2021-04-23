# NodeJS Device Management w/ Authentication

A NodeJS REST API with basic device management functionality and a persistent authentication strategy using refreshable JSON web tokens.

![Device Management](https://github.com/pererasys/nodejs-device-auth/blob/3-login/register/docs/diagram.png?raw=true)

## Architecture

In this project, we will be using a refreshable JWT to maintain authentication across multiple devices. When a user logs in or creates an account, we log the device that was used and create a dedicated refresh token which is stored with the device.

Each device has a unique set of refresh tokens, which may only be used in conjunction with said device. These tokens have a set expiration date, which can be extended when access tokens are refreshed, and will be revoked if used after this date. Similarly, all refresh tokens associated with a device are revoked when a user logs out.

![Authentication flow](https://github.com/pererasys/nodejs-device-auth/blob/3-login/register/docs/auth-flow.png?raw=true)

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

While we have a Docker composition to run the whole project, we want to continue using Nodemon in development. The database has been exposed on your local host, so you can start the service by running the container on its own.

```
docker-compose up mongodb
```

After the database has started, the NodeJS application should be able to establish a connection.

**Testing the application**

This project has a number of unit and integration test cases backed by Jest and Supertest. Run the following command to perform all test cases.

```
yarn test
```

## Production

### Option 1 - Standalone REST API

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

### Option 2 - Docker

In this step we configured a Docker composition for our application to run behind Nginx. To start the containerized application, simply run the following command.

```
docker-compose up
```
