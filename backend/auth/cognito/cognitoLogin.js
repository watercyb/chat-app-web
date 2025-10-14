import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

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
