import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";

const buyerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\+?[\d\s-]{10,}$/.test(v);
        },
        message: "Please provide a valid phone number",
      },
    },

    location: {
      address: {
        type: String,
        trim: true,
        maxlength: [200, "Address cannot exceed 200 characters"],
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: "US",
      },
      zipCode: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return /^\d{5}(-\d{4})?$/.test(v);
          },
          message: "Please provide a valid zip code",
        },
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    accountCreationToken: {
      type: String,
      select: false,
    },

    accountCreationTokenExpires: {
      type: Date,
      select: false,
    },

    accountCreationTokenUsed: {
      type: Boolean,
      default: false,
    },

    accountSetupCompleted: {
      type: Boolean,
      default: false,
    },

    accountSetupCompletedAt: Date,

    registrationSource: {
      type: String,
      enum: ["website", "mobile_app", "admin", "social_media", "api", "import"],
      default: "website",
    },

    registrationIP: String,

    registrationUserAgent: String,

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: Date,

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerifiedAt: Date,

    accountStatus: {
      type: String,
      enum: ["pending_setup", "active", "inactive", "suspended", "deleted"],
      default: "pending_setup",
    },

    profilePicture: {
      type: String,
      default: "default-avatar.png",
    },

    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (v) {
          return v && v < new Date();
        },
        message: "Date of birth must be in the past",
      },
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },

    preferences: {
      currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
      },
      language: {
        type: String,
        default: "en",
        enum: ["en", "es", "fr", "de", "it", "pt"],
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
        promotional: { type: Boolean, default: true },
        orderUpdates: { type: Boolean, default: true },
      },
      wishlist: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
    },

    shippingAddresses: [
      {
        label: {
          type: String,
          trim: true,
          default: "Home",
        },
        fullName: {
          type: String,
          required: true,
          trim: true,
        },
        phone: {
          type: String,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
        zipCode: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    paymentMethods: [
      {
        type: {
          type: String,
          enum: ["credit_card", "debit_card", "paypal", "bank_transfer"],
        },
        lastFourDigits: String,
        cardHolderName: String,
        expiryDate: String,
        billingAddress: {
          address: String,
          city: String,
          state: String,
          country: String,
          zipCode: String,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        token: String,
      },
    ],

    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: Date,

    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    tokensIssued: [
      {
        token: String,
        type: {
          type: String,
          enum: [
            "account_creation",
            "email_verification",
            "password_reset",
            "refresh",
          ],
        },
        issuedAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date,
        isUsed: {
          type: Boolean,
          default: false,
        },
        usedAt: Date,
      },
    ],

    deletionRequestedAt: Date,
    deletionReason: String,
    deletionToken: {
      type: String,
      select: false,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },

    loyaltyPoints: {
      type: Number,
      default: 0,
    },

    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

buyerSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return "Account Setup Pending";
});

buyerSchema.virtual("age").get(function () {
  if (this.dateOfBirth) {
    return Math.floor(
      (Date.now() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000),
    );
  }
  return null;
});

buyerSchema.virtual("isAccountCreationTokenValid").get(function () {
  return (
    this.accountCreationToken &&
    this.accountCreationTokenExpires > Date.now() &&
    !this.accountCreationTokenUsed
  );
});

buyerSchema.index({ email: 1 });
buyerSchema.index({ accountCreationToken: 1 });
buyerSchema.index(
  { accountCreationTokenExpires: 1 },
  { expireAfterSeconds: 0 },
);
buyerSchema.index({ "location.country": 1, "location.city": 1 });
buyerSchema.index({ referralCode: 1 });
buyerSchema.index({ createdAt: -1 });
buyerSchema.index({ accountStatus: 1 });

buyerSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }

    next();
  } catch (error) {
    next(error);
  }
});

buyerSchema.pre("save", function (next) {
  if (
    this.firstName &&
    this.lastName &&
    this.password &&
    this.location?.city &&
    this.location?.state &&
    this.location?.country &&
    this.location?.zipCode
  ) {
    if (!this.accountSetupCompleted) {
      this.accountSetupCompleted = true;
      this.accountSetupCompletedAt = new Date();
      this.accountStatus = "active";

      if (this.accountCreationToken) {
        this.accountCreationTokenUsed = true;

        const tokenEntry = this.tokensIssued.find(
          (t) =>
            t.token === this.accountCreationToken &&
            t.type === "account_creation",
        );
        if (tokenEntry) {
          tokenEntry.isUsed = true;
          tokenEntry.usedAt = new Date();
        }
      }
    }
  }

  next();
});

buyerSchema.methods.generateAccountCreationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.accountCreationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.accountCreationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  this.accountCreationTokenUsed = false;

  this.tokensIssued.push({
    token: this.accountCreationToken,
    type: "account_creation",
    issuedAt: new Date(),
    expiresAt: this.accountCreationTokenExpires,
    isUsed: false,
  });

  return token;
};

buyerSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  this.tokensIssued.push({
    token: this.emailVerificationToken,
    type: "email_verification",
    issuedAt: new Date(),
    expiresAt: this.emailVerificationExpires,
    isUsed: false,
  });

  return token;
};

buyerSchema.methods.verifyAccountCreationToken = function (token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  if (this.accountCreationToken !== hashedToken) {
    return false;
  }

  if (this.accountCreationTokenExpires < Date.now()) {
    return false;
  }

  if (this.accountCreationTokenUsed) {
    return false;
  }

  return true;
};

buyerSchema.methods.completeAccountSetup = async function (token, accountData) {
  if (!this.verifyAccountCreationToken(token)) {
    throw new Error("Invalid or expired account creation token");
  }

  this.firstName = accountData.firstName;
  this.lastName = accountData.lastName;
  this.password = accountData.password;
  this.phone = accountData.phone;

  if (accountData.location) {
    this.location = {
      ...this.location,
      ...accountData.location,
    };
  }

  if (accountData.dateOfBirth) {
    this.dateOfBirth = accountData.dateOfBirth;
  }

  if (accountData.gender) {
    this.gender = accountData.gender;
  }

  await this.save();

  return this;
};

buyerSchema.methods.invalidateAccountCreationToken = function () {
  this.accountCreationToken = undefined;
  this.accountCreationTokenExpires = undefined;
  this.accountCreationTokenUsed = true;
};

buyerSchema.methods.isAccountSetupPending = function () {
  return (
    !this.accountSetupCompleted &&
    this.accountCreationToken &&
    !this.accountCreationTokenUsed &&
    this.accountCreationTokenExpires > Date.now()
  );
};

buyerSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

buyerSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

buyerSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 1 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

buyerSchema.statics.findByAccountCreationToken = function (token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return this.findOne({
    accountCreationToken: hashedToken,
    accountCreationTokenExpires: { $gt: Date.now() },
    accountCreationTokenUsed: false,
    accountSetupCompleted: false,
  }).select("+accountCreationToken +accountCreationTokenExpires");
};

buyerSchema.statics.createAccountWithEmail = async function (
  email,
  registrationData = {},
) {
  const existingBuyer = await this.findOne({ email });
  if (existingBuyer) {
    throw new Error("Email already registered");
  }

  const buyer = new this({
    email,
    registrationSource: registrationData.source || "website",
    registrationIP: registrationData.ip,
    registrationUserAgent: registrationData.userAgent,
    accountStatus: "pending_setup",
  });

  const token = buyer.generateAccountCreationToken();

  await buyer.save();

  return {
    buyer,
    token,
  };
};

const Buyer = mongoose.model("Buyer", buyerSchema);

export default Buyer;
