const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

// Validation middleware
const validateAppointment = [
  body('doctorId').isMongoId(),
  body('appointmentDate').isISO8601().toDate(),
  body('appointmentTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('appointmentType').isIn(['consultation', 'follow-up', 'emergency', 'routine']),
  body('symptoms').optional().trim()
];

const validateAppointmentUpdate = [
  body('status').optional().isIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show']),
  body('diagnosis').optional().trim(),
  body('prescription').optional().isArray(),
  body('prescription.*.medicine').optional().trim(),
  body('prescription.*.dosage').optional().trim(),
  body('prescription.*.duration').optional().trim(),
  body('prescription.*.notes').optional().trim(),
  body('notes').optional().trim(),
  body('followUpDate').optional().isISO8601().toDate()
];

// Routes
router.post('/',
  authMiddleware,
  authMiddleware.authorize('patient'),
  validateAppointment,
  appointmentController.bookAppointment
);

router.get('/patient',
  authMiddleware,
  authMiddleware.authorize('patient'),
  appointmentController.getPatientAppointments
);

router.get('/doctor',
  authMiddleware,
  authMiddleware.authorize('doctor'),
  appointmentController.getDoctorAppointments
);

router.get('/slots',
  authMiddleware,
  query('doctorId').isMongoId(),
  query('date').isISO8601(),
  appointmentController.getAvailableSlots
);

router.put('/:id',
  authMiddleware,
  param('id').isMongoId(),
  validateAppointmentUpdate,
  appointmentController.updateAppointmentStatus
);

router.delete('/:id',
  authMiddleware,
  authMiddleware.authorize('patient'),
  param('id').isMongoId(),
  appointmentController.cancelAppointment
);

module.exports = router;