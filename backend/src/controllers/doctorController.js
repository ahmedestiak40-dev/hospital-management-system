const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const { validationResult } = require('express-validator');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const { department, specialization, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    query.isOnLeave = false;
    
    const doctors = await Doctor.find(query)
      .populate('user', 'email profile')
      .populate('department', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ experience: -1 });
    
    const total = await Doctor.countDocuments(query);
    
    res.json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'email profile')
      .populate('department', 'name description location')
      .populate('currentPatients', 'patientId');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .populate('patient', 'patientId')
    .sort({ appointmentTime: 1 });
    
    // Get doctor statistics
    const totalAppointments = await Appointment.countDocuments({ doctor: doctor._id });
    const completedAppointments = await Appointment.countDocuments({ 
      doctor: doctor._id, 
      status: 'completed' 
    });
    
    res.json({
      doctor,
      todaysAppointments,
      statistics: {
        totalAppointments,
        completedAppointments,
        currentPatients: doctor.currentPatients.length,
        maxPatientsPerDay: doctor.maxPatientsPerDay
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current doctor profile
exports.getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId })
      .populate('user', 'email profile')
      .populate('department', 'name');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    res.json({ doctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update doctor availability
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    
    const doctor = await Doctor.findOne({ user: req.userId });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    doctor.availability = availability;
    doctor.updatedAt = new Date();
    
    await doctor.save();
    
    res.json({
      message: 'Availability updated successfully',
      availability: doctor.availability
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update doctor profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const {
      specialization,
      department,
      qualifications,
      experience,
      consultationFee,
      maxPatientsPerDay
    } = req.body;
    
    const doctor = await Doctor.findOne({ user: req.userId });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    // Update fields
    if (specialization !== undefined) doctor.specialization = specialization;
    if (department !== undefined) doctor.department = department;
    if (qualifications !== undefined) doctor.qualifications = qualifications;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (maxPatientsPerDay !== undefined) doctor.maxPatientsPerDay = maxPatientsPerDay;
    
    doctor.updatedAt = new Date();
    
    await doctor.save();
    
    res.json({
      message: 'Doctor profile updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set leave status
exports.setLeaveStatus = async (req, res) => {
  try {
    const { isOnLeave, leaveReason, leaveUntil } = req.body;
    
    const doctor = await Doctor.findOne({ user: req.userId });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    doctor.isOnLeave = isOnLeave;
    
    if (isOnLeave) {
      doctor.leaveReason = leaveReason;
      doctor.leaveUntil = leaveUntil;
    } else {
      doctor.leaveReason = undefined;
      doctor.leaveUntil = undefined;
    }
    
    doctor.updatedAt = new Date();
    
    await doctor.save();
    
    res.json({
      message: isOnLeave ? 'Leave status set successfully' : 'Back to work status set',
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get doctor statistics
exports.getDoctorStatistics = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const totalAppointments = await Appointment.countDocuments({ doctor: doctor._id });
    const monthlyAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      createdAt: { $gte: startOfMonth }
    });
    const weeklyAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      createdAt: { $gte: startOfWeek }
    });
    const completedAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      status: 'completed'
    });
    
    // Appointment status distribution
    const statusDistribution = await Appointment.aggregate([
      {
        $match: { doctor: doctor._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      statistics: {
        totalAppointments,
        monthlyAppointments,
        weeklyAppointments,
        completedAppointments,
        completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(2) : 0,
        currentPatients: doctor.currentPatients.length,
        statusDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};