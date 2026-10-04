module.exports = {
  ROLES: {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    PATIENT: 'patient',
    STAFF: 'staff'
  },
  
  APPOINTMENT_STATUS: {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    NO_SHOW: 'no-show'
  },
  
  APPOINTMENT_TYPES: {
    CONSULTATION: 'consultation',
    FOLLOW_UP: 'follow-up',
    EMERGENCY: 'emergency',
    ROUTINE: 'routine'
  },
  
  BLOOD_GROUPS: [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ],
  
  GENDERS: ['male', 'female', 'other'],
  
  DAYS_OF_WEEK: [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ],
  
  SHIFTS: ['morning', 'evening', 'night', 'general'],
  
  DEPARTMENT_SERVICES: [
    'Consultation',
    'Emergency Care',
    'Surgery',
    'Diagnostic Imaging',
    'Laboratory Tests',
    'Pharmacy',
    'Physical Therapy',
    'Maternity Care',
    'Pediatric Care',
    'Geriatric Care',
    'Mental Health',
    'Dental Care',
    'Optometry',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Oncology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology'
  ]
};