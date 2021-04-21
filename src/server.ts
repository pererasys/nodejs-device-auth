/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { buildApp } from "./app";
import * as settings from "./settings";

/**
 * Start the application
 */

const app = buildApp();

app.listen(settings.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started at http://localhost:${settings.PORT}`);
});
