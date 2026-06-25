import { verifyAccessToken } from "../utils/jwtUtils.js";
import Buyer from "../models/buyer.model.js";
import AppError from "../utils/AppError.js";

const auth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(
        new AppError(
          "You are not logged in. Please log in to get access.",
          401,
        ),
      );
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(
          new AppError("Your session has expired. Please log in again.", 401),
        );
      }
      return next(new AppError("Invalid token. Please log in again.", 401));
    }

    const buyer = await Buyer.findById(decoded.id);

    if (!buyer) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401),
      );
    }

    if (buyer.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password. Please log in again.",
          401,
        ),
      );
    }

    if (buyer.accountStatus !== "active") {
      return next(
        new AppError(
          "Your account is not active. Please contact support.",
          403,
        ),
      );
    }

    req.user = buyer;
    next();
  } catch (error) {
    next(error);
  }
};

const restrictTo = (...statuses) => {
  return (req, res, next) => {
    if (!statuses.includes(req.user.accountStatus)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

export { auth, restrictTo };
