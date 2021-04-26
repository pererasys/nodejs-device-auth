/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import express from "express";

const app = express();

app.get("/", async (req, res) => {
  return res.status(200).send("Hello world!");
});

export default app;
