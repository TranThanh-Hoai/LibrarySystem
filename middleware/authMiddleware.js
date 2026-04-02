/**
 * Authentication middleware for role-based authorization
 * Check if user has admin role
 * 
 * Note: In production, extract user role from JWT token
 * This is a mock implementation for demonstration
 */

const authMiddleware = (requiredRole = 'admin') => {
  return (req, res, next) => {
    try {
      // Mock: In production, extract from JWT token
      // const token = req.headers.authorization?.split(' ')[1];
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // req.user = decoded;

      // For demonstration: get user from request body or headers
      const userRole = req.headers['x-user-role'] || 'user';
      
      // Check if user has required role
      if (userRole !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${requiredRole}`,
          data: null
        });
      }

      // Attach user info to request (mock)
      req.user = {
        role: userRole,
        id: req.headers['x-user-id'] || 'mock-user-id'
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
        data: null
      });
    }
  };
};

module.exports = authMiddleware;
