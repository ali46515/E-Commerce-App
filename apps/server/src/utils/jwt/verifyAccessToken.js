import jwt from "jsonwebtoken";

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_PUBLIC_KEY, {
    algorithms: ["RS256"],
  });
};
