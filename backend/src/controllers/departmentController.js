const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('headDoctor', 'doctorId user')
      .populate({
        path: 'headDoctor',
        populate: {
          path: 'user',
          select: 'profile'
        }
      })
      .sort({ name: 1 });
    
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headDoctor', 'doctorId specialization user')
      .populate({
        path: 'headDoctor',
        populate: {
          path: 'user',
          select: 'profile'
        }
      });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get department doctors
    const doctors = await Doctor.find({ 
      department: department._id,
      isOnLeave: false 
    })
    .populate('user', 'profile')
    .select('doctorId specialization experience consultationFee availability');
    
    // Get department staff
    const staff = await Staff.find({ 
      department: department._id,
      isActive: true 
    })
    .populate('user', 'profile')
    .select('staffId designation shift');
    
    res.json({
      department,
      doctors,
      staff: staff.length,
      staffList: staff.slice(0, 10) // Return first 10 staff members
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new department
exports.createDepartment = async (req, res) => {
  try {
    const {
      name,
      description,
      headDoctor,
      phone,
      email,
      location,
      floor,
      roomNumber,
      services
    } = req.body;
    
    // Check if department already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }
    
    const department = new Department({
      name,
      description,
      headDoctor,
      phone,
      email,
      location,
      floor,
      roomNumber,
      services: services || []
    });
    
    await department.save();
    
    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Update fields
    const updatableFields = [
      'name', 'description', 'headDoctor', 'phone', 'email',
      'location', 'floor', 'roomNumber', 'services', 'isActive'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        department[field] = req.body[field];
      }
    });
    
    department.updatedAt = new Date();
    
    await department.save();
    
    res.json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if department has doctors
    const doctorCount = await Doctor.countDocuments({ department: department._id });
    if (doctorCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with assigned doctors. Reassign doctors first.' 
      });
    }
    
    await department.deleteOne();
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get department statistics
exports.getDepartmentStatistics = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    
    const statistics = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({ 
          department: dept._id,
          isOnLeave: false 
        });
        
        const staffCount = await Staff.countDocuments({ 
          department: dept._id,
          isActive: true 
        });
        
        // Get appointments for this month for department doctors
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const doctors = await Doctor.find({ department: dept._id }).select('_id');
        const doctorIds = doctors.map(doc => doc._id);
        
        const monthlyAppointments = await Department.aggregate([
          {
            $match: { _id: dept._id }
          },
          {
            $lookup: {
              from: 'doctors',
              localField: '_id',
              foreignField: 'department',
              as: 'doctors'
            }
          },
          {
            $unwind: '$doctors'
          },
          {
            $lookup: {
              from: 'appointments',
              let: { doctorId: '$doctors._id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$doctor', '$$doctorId'] },
                        { $gte: ['$createdAt', startOfMonth] }
                      ]
                    }
                  }
                }
              ],
              as: 'appointments'
            }
          },
          {
            $group: {
              _id: '$_id',
              totalAppointments: { $sum: { $size: '$appointments' } }
            }
          }
        ]);
        
        return {
          departmentId: dept._id,
          departmentName: dept.name,
          doctorCount,
          staffCount,
          monthlyAppointments: monthlyAppointments[0]?.totalAppointments || 0
        };
      })
    );
    
    res.json({ statistics });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};