import { Schema, model, type InferSchemaType } from 'mongoose';
const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, select: false },
  avatarUrl: { type: String, default: '' },
  githubId: { type: String, sparse: true, unique: true },
  githubUsername: { type: String, default: '' },
  githubAccessToken: { type: String, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  preferences: {
  theme: {
    type: String,
    enum: ['dark', 'light', 'system'],
    default: 'dark'
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  productUpdates: {
    type: Boolean,
    default: true
  },
  issueAssignments: {
    type: Boolean,
    default: true
  },
  weeklyDigest: {
    type: Boolean,
    default: false
  },
  compactDensity: {
    type: Boolean,
    default: false
  }
},
  lastLoginAt: { type: Date }
}, { timestamps: true, versionKey: false });
export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
