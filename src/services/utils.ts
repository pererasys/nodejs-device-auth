/**
 * @author Andrew Perera
 * Copyright (c) 2021
 */

export class ServiceError extends Error {
  status: number;

  constructor(
    message = "An error occurred while processing your request.",
    status = 500
  ) {
    super(message);

    this.name = "ServiceError";
    this.status = status;
  }

  toJSON() {
    return { message: this.message };
  }
}

export class ValidationError extends ServiceError {
  invalidArgs: string[];

  constructor(message = "Invalid arguments.", invalidArgs: string[]) {
    super(message, 400);

    this.name = "ValidationError";
    this.invalidArgs = invalidArgs;
  }

  toJSON() {
    return {
      message: this.message,
      invalidArgs: this.invalidArgs,
    };
  }
}
