# NodeJS Device Management w/ Authentication

A NodeJS REST API with basic device management functionality and a persistent authentication strategy using refreshable JSON web tokens.

### Setup

**Install Yarn**

This project uses yarn to manage dependencies, visit the link below for installation instructions.

https://classic.yarnpkg.com/en/docs/install/

**Install Dependencies**

```
yarn install
```

### Running in development

For local development, this project uses Nodemon to take advantage of hot-reloading when files are updated. There is a predefined script to run the server in the Nodemon environment.

```
yarn start:dev
```

### Building the application (TS -> JS)

This project uses Typescript, so production builds will be compiled down to standard Javascript. There is a predefined script to lint the code and create a production build.

```
yarn build
```
