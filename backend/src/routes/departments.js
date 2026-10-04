const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');

// Validation middleware
const validateDepartment = [
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('headDoctor').optional().isMongoId(),
  body('phone').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('location').optional().trim(),
  body('floor').optional().isInt({ min: 0 }),
  body('roomNumber').optional().trim(),
  body('services').optional().isArray()
];

// Routes
router.get('/',
  authMiddleware,
  departmentController.getAllDepartments
);

router.get('/statistics',
  authMiddleware,
  authMiddleware.authorize('admin'),
  departmentController.getDepartmentStatistics
);

router.get('/:id',
  authMiddleware,
  param('id').isMongoId(),
  departmentController.getDepartmentById
);

router.post('/',
  authMiddleware,
  authMiddleware.authorize('admin'),
  validateDepartment,
  departmentController.createDepartment
);

router.put('/:id',
  authMiddleware,
  authMiddleware.authorize('admin'),
  param('id').isMongoId(),
  validateDepartment,
  departmentController.updateDepartment
);

router.delete('/:id',
  authMiddleware,
  authMiddleware.authorize('admin'),
  param('id').isMongoId(),
  departmentController.deleteDepartment
);

module.exports = router;