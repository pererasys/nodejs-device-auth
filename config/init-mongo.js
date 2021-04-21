conn = new Mongo();

db = conn.getDB("admin");

db.createUser({
  user: "api",
  pwd: "password",
  roles: [
    { role: "read", db: "admin" },
    { role: "readWrite", db: "nodejs-device-auth" },
  ],
});
