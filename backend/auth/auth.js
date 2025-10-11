let auth;

switch (process.env.AUTH_TYPE) {
  case "db":
    auth = await import("./db/db.js");
    break;
  case "cognito":
    auth = await import("./cognito/cognito.js");
    break;
  default:
    throw new Error(`Unknown AUTH_TYPE: ${process.env.AUTH_TYPE}`);
}

export const { signup, login, verifyToken } = auth;
