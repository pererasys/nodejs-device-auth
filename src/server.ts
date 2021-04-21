/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

import { buildApp } from "./app";
import * as settings from "./settings";

/**
 * Start the application
 */

const app = buildApp({ port: settings.PORT });

app.start();
