const { Router } = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/me', authenticateToken, authController.withdraw);

module.exports = router;
