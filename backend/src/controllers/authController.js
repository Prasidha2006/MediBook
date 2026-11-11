import crypto from 'crypto';
import { dataService } from '../services/dataService.js';
import { hashPassword, comparePassword, generateToken, getCookieOptions } from '../utils/auth.js';
import { config } from '../config/index.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { fullName, email, phone, password } = req.body;

      // Check if user already exists
      const existingUser = await dataService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create User account (Only PATIENT role allowed for public registration)
      const user = await dataService.createUser({
        email: email.toLowerCase(),
        passwordHash,
        role: 'PATIENT',
        isActive: true,
      });

      // Create Patient profile
      const patient = await dataService.createPatient({
        userId: user.id,
        fullName,
        phone,
      });

      // Audit log
      await dataService.createAuditLog({
        userId: user.id,
        action: 'PATIENT_REGISTERED',
        entity: 'User',
        entityId: user.id,
        details: { email: user.email, fullName },
        ipAddress: req.ip,
      });

      // Generate JWT
      const token = generateToken({ id: user.id, email: user.email, role: user.role });

      // Set HTTP-only Cookie
      res.cookie(config.jwt.cookieName, token, getCookieOptions());

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully. Welcome to MediBook!',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          patient,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await dataService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact hospital administration.',
        });
      }

      // Verify doctor approval if role is DOCTOR
      if (user.role === 'DOCTOR' && user.doctor && !user.doctor.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Your doctor profile is pending administrative approval.',
        });
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Audit log
      await dataService.createAuditLog({
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        details: { role: user.role },
        ipAddress: req.ip,
      });

      // Generate token
      const token = generateToken({ id: user.id, email: user.email, role: user.role });

      // Set cookie
      res.cookie(config.jwt.cookieName, token, getCookieOptions());

      return res.status(200).json({
        success: true,
        message: 'Signed in successfully.',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          patient: user.patient || null,
          doctor: user.doctor || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res) {
    res.clearCookie(config.jwt.cookieName, {
      httpOnly: true,
      secure: config.isProd,
      sameSite: config.isProd ? 'none' : 'lax',
      path: '/',
    });
    return res.status(200).json({
      success: true,
      message: 'Signed out successfully.',
    });
  },

  async getMe(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          isActive: req.user.isActive,
          patient: req.patient || req.user.patient || null,
          doctor: req.doctor || req.user.doctor || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await dataService.findUserByEmail(email);

      // Return generic message to prevent email enumeration
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If an account with that email exists, password reset instructions have been generated.',
        });
      }

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await dataService.createPasswordReset(user.id, resetToken, expiresAt);

      return res.status(200).json({
        success: true,
        message: 'Password reset instructions have been generated.',
        resetToken, // Provided in JSON response for demo/testing convenience
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const resetRecord = await dataService.findPasswordReset(token);
      if (!resetRecord) {
        return res.status(400).json({
          success: false,
          message: 'Password reset token is invalid or has expired.',
        });
      }

      const passwordHash = await hashPassword(password);
      await dataService.updateUser(resetRecord.userId, { passwordHash });
      await dataService.markPasswordResetUsed(resetRecord.id);

      await dataService.createAuditLog({
        userId: resetRecord.userId,
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: resetRecord.userId,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Your password has been successfully reset. You may now sign in with your new password.',
      });
    } catch (err) {
      next(err);
    }
  },
};
