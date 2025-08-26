// models/EmailOtpVerification.js
import mongoose from "mongoose";

const emailOtpVerificationSchema = new mongoose.Schema(
  {
    // Unique verification session/id (e.g., UUID you send back to the client)
    verificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // The email being verified
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // OTP code (store hashed if you prefer; simple version keeps it as string)
    otp: {
      type: String,
      required: true,
    },

    // When this OTP expires
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    // Mark once verified
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

emailOtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailOtpVerification = mongoose.model(
  "EmailOtpVerification",
  emailOtpVerificationSchema
);

export default EmailOtpVerification;
