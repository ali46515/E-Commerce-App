import Buyer from "../models/buyer.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";
import { sendAccountCreationEmail } from "../services/email.service.js";
import AppError from "../utils/AppError.js";
import crypto from "crypto";

const setTokenCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh",
  });
};

const signup = async (req, res, next) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const { buyer, token: rawToken } = await Buyer.createAccountWithEmail(
      email,
      {
        source: req.body.registrationSource || "website",
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    );

    try {
      const fullName =
        firstName && lastName ? `${firstName} ${lastName}` : null;
      await sendAccountCreationEmail(email, rawToken, fullName);
    } catch (emailError) {
      console.error("Failed to send account creation email:", emailError);
      // Add Log for the attempt
    }

    res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email to complete setup.",
      data: {
        email: buyer.email,
        accountStatus: buyer.accountStatus,
        // Raw token for testing
        ...(process.env.NODE_ENV === "development" && {
          accountCreationToken: rawToken,
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Account activation after email verification
const activateAccount = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return next(new AppError("Activation token is required", 400));
    }

    const buyer = await Buyer.findByAccountCreationToken(token);

    if (!buyer) {
      return next(new AppError("Invalid or expired activation token", 400));
    }

    res.status(200).json({
      success: true,
      message: "Token is valid. Please complete your account setup.",
      data: {
        email: buyer.email,
        token, // Same token for setup completion
      },
    });
  } catch (error) {
    next(error);
  }
};

// Complete account setup with user details after verification
const completeAccountSetup = async (req, res, next) => {
  try {
    const {
      token,
      firstName,
      lastName,
      password,
      phone,
      location,
      dateOfBirth,
      gender,
    } = req.body;

    if (!token || !firstName || !lastName || !password) {
      return next(
        new AppError(
          "Token, first name, last name, and password are required",
          400,
        ),
      );
    }

    const buyer = await Buyer.findByAccountCreationToken(token);

    if (!buyer) {
      return next(new AppError("Invalid or expired setup token", 400));
    }

    await buyer.completeAccountSetup(token, {
      firstName,
      lastName,
      password,
      phone,
      location,
      dateOfBirth,
      gender,
    });

    const accessToken = generateAccessToken(buyer._id);
    const refreshToken = generateRefreshToken(buyer._id);

    buyer.tokensIssued.push({
      token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      type: "refresh",
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isUsed: false,
    });

    buyer.lastLogin = new Date();
    buyer.loginAttempts = 0;
    await buyer.save();

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Account setup completed successfully",
      data: {
        id: buyer._id,
        email: buyer.email,
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        fullName: buyer.fullName,
        accountStatus: buyer.accountStatus,
        tier: buyer.tier,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login buyer
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const buyer = await Buyer.findOne({ email }).select(
      "+password +accountCreationToken +accountCreationTokenExpires",
    );

    if (!buyer) {
      return next(new AppError("Invalid email or password", 401));
    }

    if (buyer.accountStatus === "pending_setup") {
      return next(
        new AppError(
          "Account setup not completed. Please check your email for setup instructions.",
          401,
        ),
      );
    }

    if (buyer.accountStatus === "suspended") {
      return next(
        new AppError(
          "Your account has been suspended. Please contact support.",
          403,
        ),
      );
    }

    if (buyer.accountStatus === "deleted") {
      return next(
        new AppError(
          "This account has been deleted. Please create a new account.",
          401,
        ),
      );
    }

    if (buyer.lockUntil && buyer.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil(
        (buyer.lockUntil - Date.now()) / (60 * 1000),
      );
      return next(
        new AppError(
          `Account temporarily locked. Please try again in ${minutesLeft} minutes.`,
          423,
        ),
      );
    }

    const isPasswordCorrect = await buyer.comparePassword(password);

    if (!isPasswordCorrect) {
      await buyer.incrementLoginAttempts();

      return next(new AppError("Invalid email or password", 401));
    }

    if (buyer.loginAttempts > 0) {
      buyer.loginAttempts = 0;
      buyer.lockUntil = undefined;
    }

    const accessToken = generateAccessToken(buyer._id);
    const refreshToken = generateRefreshToken(buyer._id);

    buyer.tokensIssued.push({
      token: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      type: "refresh",
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isUsed: false,
    });

    buyer.lastLogin = new Date();
    await buyer.save();

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: buyer._id,
        email: buyer.email,
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        fullName: buyer.fullName,
        profilePicture: buyer.profilePicture,
        accountStatus: buyer.accountStatus,
        tier: buyer.tier,
        loyaltyPoints: buyer.loyaltyPoints,
        lastLogin: buyer.lastLogin,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout buyer
const logout = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.user.id);

    if (!buyer) {
      return next(new AppError("User not found", 404));
    }

    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const hashedToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      const tokenEntry = buyer.tokensIssued.find(
        (t) => t.token === hashedToken && t.type === "refresh" && !t.isUsed,
      );

      if (tokenEntry) {
        tokenEntry.isUsed = true;
        tokenEntry.usedAt = new Date();
        await buyer.save();
      }
    }

    res.cookie("accessToken", "logged-out", {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", "logged-out", {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError("No refresh token provided", 401));
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return next(new AppError("Invalid or expired refresh token", 401));
    }

    const buyer = await Buyer.findById(decoded.id);

    if (!buyer) {
      return next(new AppError("User not found", 401));
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const tokenEntry = buyer.tokensIssued.find(
      (t) => t.token === hashedToken && t.type === "refresh" && !t.isUsed,
    );

    if (!tokenEntry) {
      return next(new AppError("Invalid refresh token", 401));
    }

    if (tokenEntry.expiresAt < new Date()) {
      return next(new AppError("Refresh token expired", 401));
    }

    tokenEntry.isUsed = true;
    tokenEntry.usedAt = new Date();

    const newAccessToken = generateAccessToken(buyer._id);
    const newRefreshToken = generateRefreshToken(buyer._id);

    buyer.tokensIssued.push({
      token: crypto.createHash("sha256").update(newRefreshToken).digest("hex"),
      type: "refresh",
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isUsed: false,
    });

    await buyer.save();

    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current buyer profile
const getMe = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.user.id)
      .populate("preferences.wishlist")
      .select("-password -passwordResetToken -passwordResetExpires");

    if (!buyer) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        buyer,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resend account activation email
const resendActivationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const buyer = await Buyer.findOne({
      email,
      accountStatus: "pending_setup",
      accountSetupCompleted: false,
    });

    if (!buyer) {
      return next(
        new AppError(
          "No pending account found with this email or account is already activated",
          404,
        ),
      );
    }

    const token = buyer.generateAccountCreationToken();
    await buyer.save();

    try {
      await sendAccountCreationEmail(buyer.email, token);
    } catch (emailError) {
      console.error("Failed to send activation email:", emailError);
      return next(new AppError("Failed to send activation email", 500));
    }

    res.status(200).json({
      success: true,
      message: "Activation email resent successfully. Please check your email.",
      ...(process.env.NODE_ENV === "development" && {
        accountCreationToken: token,
      }),
    });
  } catch (error) {
    next(error);
  }
};

export {
  signup,
  activateAccount,
  completeAccountSetup,
  login,
  logout,
  refreshToken,
  getMe,
  resendActivationEmail,
};
