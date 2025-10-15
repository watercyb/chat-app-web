import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

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

export const cognitoLogin = async (email, password) => {
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
  return { IdToken, RefreshToken };
};

export const cognitoCheckEmail = async (email) => {
  try {
    await cognito.send(
      new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: email,
      })
    );
    return true;
  } catch (err) {
    if (err.name === "UserNotFoundException") return false;
    throw new Error(err);
  }
};

export const cognitoSignup = async (fullName, email, password) => {
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
  return userInfo;
};

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyIdToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}
