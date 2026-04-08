import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '../constants';

/**
 * TypeScript interface for the User document
 */
export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  status: UserStatus;
  otp?: string;
  otpExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User Mongoose Schema
 */
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Never return password in queries unless explicitly requested
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.PATIENT,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },

    // OTP fields (cleared after successful verification)
    otp: {
      type: String,
      select: false,
    },

    otpExpiry: {
      type: Date,
      select: false,
    },

    // Password reset fields
    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Remove __v field
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// Note: email index is already created implicitly by unique: true in the schema
UserSchema.index({ resetPasswordToken: 1 });

// ─── Pre-save Hook: Hash Password ────────────────────────────────────────────
UserSchema.pre('save', async function () {
  // Only hash if password was modified
  if (!this.isModified('password')) return;

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
