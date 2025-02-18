const jwt = require("jsonwebtoken");

const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({message: "User not authenticated"});
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;

      console.log("req.user", req.user);

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({message: "Access forbidden: Insufficient permissions"});
      }

      next();
    } catch (error) {
      return res.status(403).json({message: "Invalid token", error: error.message});
    }
  };
};

module.exports = authMiddleware;
