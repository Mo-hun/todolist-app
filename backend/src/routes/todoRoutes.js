const { Router } = require('express');
const todoController = require('../controllers/todoController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = Router();

router.use(authenticateToken);

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.get('/:id', todoController.getTodoById);
router.put('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);
router.patch('/:id/complete', todoController.completeTodo);

module.exports = router;
