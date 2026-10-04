const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

// Validation middleware
const validateDoctorUpdate = [
  body('specialization').optional().trim().notEmpty(),
  body('department').optional().isMongoId(),
  body('experience').optional().isInt({ min: 0 }),
  body('consultationFee').optional().isFloat({ min: 0 }),
  body('maxPatientsPerDay').optional().isInt({ min: 1, max: 100 })
];

const validateAvailability = [
  body('availability').isArray(),
  body('availability.*.dayOfWeek').isInt({ min: 0, max: 6 }),
  body('availability.*.startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('availability.*.endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('availability.*.isAvailable').isBoolean()
];

// Routes
router.get('/',
  authMiddleware,
  doctorController.getAllDoctors
);

router.get('/me',
  authMiddleware,
  authMiddleware.authorize('doctor'),
  doctorController.getMyProfile
);

router.get('/statistics',
  authMiddleware,
  authMiddleware.authorize('doctor'),
  doctorController.getDoctorStatistics
);

router.get('/:id',
  authMiddleware,
  param('id').isMongoId(),
  doctorController.getDoctorById
);

router.put('/me',
  authMiddleware,
  authMiddleware.authorize('doctor'),
  validateDoctorUpdate,
  doctorController.updateDoctorProfile
);

router.put('/availability',
  authMiddleware,
  authMiddleware.authorize('doctor'),
  validateAvailability,
  doctorController.updateAvailability
);

router.put('/leave-status',
  authMiddleware,
  authMiddleware.authorize('doctor'),
  doctorController.setLeaveStatus
);

module.exports = router;