import { verifyToken } from '../utils/auth.js';
import { dataService } from '../services/dataService.js';
import { config } from '../config/index.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Try reading from cookie
    if (req.cookies && req.cookies[config.jwt.cookieName]) {
      token = req.cookies[config.jwt.cookieName];
    }

    // 2. Fall back to Authorization Header (Bearer token)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access this resource.',
      });
    }

    const decoded = verifyToken(token);
    const user = await dataService.findUserById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists.',
      });
    }

    req.user = user;
    if (user.role === 'PATIENT') {
      req.patient = await dataService.findPatientByUserId(user.id);
    } else if (user.role === 'DOCTOR') {
      req.doctor = await dataService.findDoctorByUserId(user.id);
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access restricted to [${allowedRoles.join(', ')}] role(s).`,
      });
    }

    next();
  };
}
