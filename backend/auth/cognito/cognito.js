import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";
import { appendToken } from "../../lib/utils.js";
import { createUser, getUserByEmail } from "../../database/db.js";
import { verifyIdToken } from "./verifyIdToken.js";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

const getSecretHash = (username, clientId, clientSecret) => {
  if (!clientSecret) return undefined;
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
};

export const signup = async (fullName, email, password) => {
  await cognito.send(
    new AdminCreateUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: fullName },
        { Name: "email_verified", Value: "true" },
      ],
      MessageAction: "SUPPRESS", // do not send invite email
    })
  );

  await cognito.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: true,
    })
  );

  const user = await cognito.send(
    new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
    })
  );

  const userInfo = {};
  user.UserAttributes.forEach((attr) => {
    userInfo[attr.Name] = attr.Value;
  });

  const newUser = {
    _id: userInfo.sub,
    email: userInfo.email,
    fullName: userInfo.name,
    createdAt: user.UserCreateDate,
    updatedAt: user.UserLastModifiedDate,
  };

  return newUser;
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const secretHash = getSecretHash(
      email,
      process.env.COGNITO_CLIENT_ID,
      process.env.COGNITO_CLIENT_SECRET
    );

    const response = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          ...(secretHash && { SECRET_HASH: secretHash }),
        },
      })
    );

    const { IdToken, AccessToken, RefreshToken, ExpiresIn } =
      response.AuthenticationResult;
    appendToken("idToken", IdToken, res);
    appendToken("refreshToken", RefreshToken, res);

    const user = await getUserByEmail(email);
    if (!user) throw Error("Cannot find user info.");
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const verifyToken = async (cookies, res) => {
  let idToken = cookies.idToken;
  if (!idToken) return null;
  const refreshToken = cookies.refreshToken;
  try {
    const decoded = await verifyIdToken(idToken);
    if (!decoded) return null;
    return decoded.sub;
  } catch (err) {
    if (!refreshToken || !res) return null;
    try {
      const response = await cognito.send(
        new InitiateAuthCommand({
          AuthFlow: "REFRESH_TOKEN_AUTH",
          ClientId: process.env.COGNITO_CLIENT_ID,
          AuthParameters: { REFRESH_TOKEN: refreshToken },
        })
      );
      idToken = response.AuthenticationResult.IdToken;
      appendToken("idToken", idToken, res);
      return jwt.decode(idToken).sub;
    } catch {
      return null;
    }
  }
};
