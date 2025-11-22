const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleController = require('../controllers/roleController');

// CRUD operations
router.post('/', auth, roleController.createRole);
router.get('/', auth, roleController.listRoles);
router.get('/:id', auth, roleController.getRole);
router.patch('/:id', auth, roleController.updateRole);
router.delete('/:id', auth, roleController.deleteRole);

// access modules operations
router.patch('/:id/accessModules/add', auth, roleController.addAccessModules);
router.patch('/:id/accessModules/remove', auth, roleController.removeAccessModules);

module.exports = router;
