/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import mongoose from "mongoose";

import { buildApp } from "./app";
import { DATABASE, PORT } from "./settings";

// Build and start the Express application

const app = buildApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started at http://localhost:${PORT}`);
});

// Connect to the database
mongoose
  .connect(`mongodb://${DATABASE.host}:${DATABASE.port}/${DATABASE.name}`, {
    authSource: "admin",
    user: DATABASE.user,
    pass: DATABASE.password,
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB.");
  })
  .catch(() => {
    // eslint-disable-next-line no-console
    console.log("An error occurred while connecting to MongoDB.");
  });
