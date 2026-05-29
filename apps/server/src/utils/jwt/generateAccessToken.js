import jwt from "jsonwebtoken";

export const generateAccessToken = ({ userId, role }) => {
  return jwt.sign(
    {
      sub: userId,
      role,
    },

    process.env.JWT_ACCESS_PRIVATE_KEY,

    {
      algorithm: "RS256",
      expiresIn: "15m",
      issuer: "ecommerce-api",
      audience: "ecommerce-client",
    },
  );
};
