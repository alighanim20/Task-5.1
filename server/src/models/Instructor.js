import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Instructor Portal account.
//
// FIXED (security lab): passwords are now hashed with bcrypt before save.
// apiKey / private contact fields are hidden from queries by default
// (select: false) so they can never leak unless explicitly requested.
const instructorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    // FIXED: select:false hides this from find()/findOne() unless .select('+password') is used
    password: { type: String, required: true, select: false },
    department: { type: String },
    role: { type: String, default: 'instructor' }, // 'instructor' | 'superadmin'

    // Sensitive "trophy" fields — hidden by default now.
    apiKey: { type: String, select: false },
    privateEmail: { type: String, select: false },
    privatePhone: { type: String, select: false }
  },
  { timestamps: true }
);

// FIXED: hash password before saving, instead of storing plaintext
instructorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export const Instructor = mongoose.model('Instructor', instructorSchema);