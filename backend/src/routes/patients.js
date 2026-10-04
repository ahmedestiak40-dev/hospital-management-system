const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

// Validation middleware
const validatePatientUpdate = [
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('height').optional().isFloat({ min: 0 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('allergies').optional().isArray(),
  body('medications').optional().isArray()
];

const validateMedicalHistory = [
  body('diagnosis').notEmpty().trim(),
  body('treatment').notEmpty().trim(),
  body('doctorId').isMongoId()
];

// Routes
router.get('/', 
  authMiddleware,
  authMiddleware.authorize('admin', 'doctor'),
  patientController.getAllPatients
);

router.get('/search',
  authMiddleware,
  authMiddleware.authorize('admin', 'doctor'),
  patientController.searchPatients
);

router.get('/me',
  authMiddleware,
  authMiddleware.authorize('patient'),
  patientController.getMyProfile
);

router.get('/:id',
  authMiddleware,
  authMiddleware.authorize('admin', 'doctor'),
  param('id').isMongoId(),
  patientController.getPatientById
);

router.put('/me',
  authMiddleware,
  authMiddleware.authorize('patient'),
  validatePatientUpdate,
  patientController.updatePatientProfile
);

router.post('/medical-history',
  authMiddleware,
  authMiddleware.authorize('patient'),
  validateMedicalHistory,
  patientController.addMedicalHistory
);

module.exports = router;