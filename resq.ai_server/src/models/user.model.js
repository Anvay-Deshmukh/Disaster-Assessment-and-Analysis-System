import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'rescue'],
    default: 'user'
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  accountLocked: {
    type: Boolean,
    default: false,
    select: false
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  // Set passwordChangedAt to current time minus 1 second
  // to ensure token is created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if user changed password after the token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Check if account is locked due to too many failed login attempts
userSchema.methods.isAccountLocked = function() {
  return this.failedLoginAttempts >= 5; // Lock after 5 failed attempts
};

// Set admin role based on email
userSchema.pre('save', function(next) {
  const adminEmails = [
    'admin@resqai.com',
    'email@123gmail.com'  // Added your email as admin
  ];
  
  const rescueEmails = [
    'rescue@1gmail.com', 'rescue@2gmail.com', 'rescue@3gmail.com',
    'rescue@4gmail.com', 'rescue@5gmail.com', 'rescue@6gmail.com',
    'rescue@7gmail.com', 'rescue@8gmail.com', 'rescue@9gmail.com',
    'rescue@10gmail.com'
  ];

  if (adminEmails.includes(this.email)) {
    this.role = 'admin';
  } else if (rescueEmails.includes(this.email)) {
    this.role = 'rescue';
  }
  
  next();
});

const User = mongoose.model('User', userSchema);

export default User;