const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');

// bulk updates
router.patch('/bulk/update-same', auth, userController.updateManySame);
router.patch('/bulk/update-different', auth, userController.updateManyDifferent);

// For admin operations require auth
router.post('/', auth, userController.createUser);
router.get('/', auth, userController.listUsers);
router.get('/:id', auth, userController.getUser);
router.patch('/:id', auth, userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);

// check user access
router.get('/:id/has-access', auth, userController.hasAccess);

module.exports = router;
