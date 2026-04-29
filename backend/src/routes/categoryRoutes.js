const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = Router();

router.use(authenticateToken);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
