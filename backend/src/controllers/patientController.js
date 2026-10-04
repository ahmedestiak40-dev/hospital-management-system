const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { validationResult } = require('express-validator');

// Get all patients (for admin/doctor)
exports.getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { patientId: { $regex: search, $options: 'i' } },
        { 'user.profile.firstName': { $regex: search, $options: 'i' } },
        { 'user.profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    
    const patients = await Patient.find(query)
      .populate('user', 'email profile')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Patient.countDocuments(query);
    
    res.json({
      patients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'email profile')
      .populate('medicalHistory.doctor', 'doctorId specialization user');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get recent appointments
    const appointments = await Appointment.find({ patient: patient._id })
      .populate('doctor', 'doctorId specialization user')
      .sort({ appointmentDate: -1 })
      .limit(10);
    
    res.json({
      patient,
      recentAppointments: appointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current patient profile
exports.getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId })
      .populate('user', 'email profile');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update patient profile
exports.updatePatientProfile = async (req, res) => {
  try {
    const {
      bloodGroup,
      height,
      weight,
      allergies,
      medications,
      emergencyContact,
      insurance
    } = req.body;
    
    const patient = await Patient.findOne({ user: req.userId });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // Update fields
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (height !== undefined) patient.height = height;
    if (weight !== undefined) patient.weight = weight;
    if (allergies !== undefined) patient.allergies = allergies;
    if (medications !== undefined) patient.medications = medications;
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;
    if (insurance !== undefined) patient.insurance = insurance;
    
    patient.updatedAt = new Date();
    
    await patient.save();
    
    res.json({
      message: 'Patient profile updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add medical history
exports.addMedicalHistory = async (req, res) => {
  try {
    const { diagnosis, treatment, doctorId } = req.body;
    
    const patient = await Patient.findOne({ user: req.userId });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    const medicalRecord = {
      date: new Date(),
      diagnosis,
      treatment,
      doctor: doctorId
    };
    
    patient.medicalHistory.push(medicalRecord);
    patient.updatedAt = new Date();
    
    await patient.save();
    
    res.status(201).json({
      message: 'Medical history added successfully',
      medicalRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search patients
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const patients = await Patient.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $match: {
          $or: [
            { patientId: { $regex: query, $options: 'i' } },
            { 'userDetails.profile.firstName': { $regex: query, $options: 'i' } },
            { 'userDetails.profile.lastName': { $regex: query, $options: 'i' } },
            { 'userDetails.email': { $regex: query, $options: 'i' } },
            { 'userDetails.profile.phone': { $regex: query, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          patientId: 1,
          bloodGroup: 1,
          'userDetails.email': 1,
          'userDetails.profile': 1
        }
      },
      {
        $limit: 20
      }
    ]);
    
    res.json({ patients });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};