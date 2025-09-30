import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d' // Fixed expiration time in a valid format (90 days)
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  
  // Set cookie expiration to 90 days from now
  const cookieExpiresInDays = 90;
  const cookieExpiration = new Date(
    Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000
  );
  
  const cookieOptions = {
    expires: cookieExpiration,
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourapp.com' : undefined
  };
  
  // Set cookie
  res.cookie('jwt', token, cookieOptions);
  
  // Remove sensitive data from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

export const signup = async (req, res, next) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role || 'user' // Default role is 'user'
    });

    // Return success response without logging in
    res.status(201).json({
      status: 'success',
      message: 'Account created successfully! Please log in.'
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      // Log failed login attempts
      if (user) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        await user.save({ validateBeforeSave: false });
      }
      return next(new AppError('Incorrect email or password', 401));
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      await user.save({ validateBeforeSave: false });
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'rescue']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Logout user by clearing the JWT cookie
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourapp.com' : undefined
  });
  
  res.status(200).json({ 
    status: 'success',
    message: 'Successfully logged out'
  });
};
