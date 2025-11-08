const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireOwnershipOrRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceUserId = parseInt(req.params.id) || parseInt(req.query.employeeId);
    const isOwner = req.user.employeeId === resourceUserId || req.user.id === resourceUserId;
    const hasRole = allowedRoles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

module.exports = { requireRole, requireOwnershipOrRole };