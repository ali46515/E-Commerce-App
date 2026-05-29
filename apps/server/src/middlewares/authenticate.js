import User from "../modules/users/user.model.js";

import { ApiError } from "../utils/responses/ApiError.js";

import { verifyAccessToken } from "../utils/jwt/verifyAccessToken.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub);

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    if (user.isSuspended) {
      throw new ApiError(403, "Account suspended");
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
