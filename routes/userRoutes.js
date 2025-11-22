const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');

// For admin operations require auth
router.post('/', auth, userController.createUser);
router.get('/', auth, userController.listUsers);
router.get('/:id', auth, userController.getUser);
router.patch('/:id', auth, userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);

// check user access
router.get('/:id/has-access', auth, userController.hasAccess);

// bulk updates
router.post('/bulk/update-same', auth, userController.updateManySame);
router.post('/bulk/update-different', auth, userController.updateManyDifferent);

module.exports = router;
