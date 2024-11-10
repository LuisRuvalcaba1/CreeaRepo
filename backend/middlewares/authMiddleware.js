// middlewares/authMiddleware.js

exports.verifyRole = (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).send('Acceso denegado');
    }
  };
  