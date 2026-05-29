import jwt from "jsonwebtoken";

export const generateRefreshToken = ({ userId, sessionId }) => {
  return jwt.sign(
    {
      sub: userId,
      sid: sessionId,
    },

    process.env.JWT_REFRESH_PRIVATE_KEY,

    {
      algorithm: "RS256",
      expiresIn: "30d",
      issuer: "ecommerce-api",
      audience: "ecommerce-client",
    },
  );
};
