/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import express from "express";

interface IAppBuilder {
  port: string | number;
}

export const buildApp = ({ port }: IAppBuilder) => {
  const app = express();

  app.get("/", async (req, res) => {
    return res.status(200).send("Hello world!");
  });

  return {
    start: () => {
      return app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Server started at http://localhost:${port}`);
      });
    },
  };
};
