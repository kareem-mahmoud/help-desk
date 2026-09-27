import mongoose from 'mongoose';
import { ROLE, ROLES } from '../constants/roles.js';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: ROLE.CUSTOMER, required: true },
    isActive: { type: Boolean, default: true, required: true },
    refreshTokenData: { type: [refreshTokenSchema], default: [] }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

export default User;
