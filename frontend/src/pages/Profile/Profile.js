import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  MedicalServices,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authAPI, patientAPI, doctorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: ''
  });
  const [medicalData, setMedicalData] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userRes = await authAPI.getProfile();
      const userProfile = userRes.data.user.profile || {};
      
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: user.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        dateOfBirth: userProfile.dateOfBirth ? 
          format(new Date(userProfile.dateOfBirth), 'yyyy-MM-dd') : '',
        gender: userProfile.gender || ''
      });

      // Fetch additional data based on role
      if (user.role === 'patient') {
        const patientRes = await patientAPI.getMyProfile();
        setMedicalData(patientRes.data.patient);
      } else if (user.role === 'doctor') {
        const doctorRes = await doctorAPI.getMyProfile();
        setDoctorData(doctorRes.data.doctor);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    // Reset to original data
    fetchProfileData();
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3
              }}
            >
              {profileData.firstName?.[0]}{profileData.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4">
                {profileData.firstName} {profileData.lastName}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    color="error"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Personal Information" />
            {user.role === 'patient' && <Tab label="Medical Information" />}
            {user.role === 'doctor' && <Tab label="Professional Information" />}
          </Tabs>

          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  disabled
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!editing}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
                {profileData.dateOfBirth && (
                  <Typography variant="caption" color="textSecondary">
                    Age: {calculateAge(profileData.dateOfBirth)} years
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Gender"
                  name="gender"
                  select
                  value={profileData.gender}
                  onChange={handleInputChange}
                  disabled={!editing}
                  SelectProps={{
                    native: true
                  }}
                >
                  <option value=""></option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={2}
                  value={profileData.address}
                  onChange={handleInputChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && user.role === 'patient' && medicalData && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Medical Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary">
                          Patient ID
                        </Typography>
                        <Typography variant="body1">
                          {medicalData.patientId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary">
                          Blood Group
                        </Typography>
                        <Typography variant="body1">
                          {medicalData.bloodGroup || 'Not specified'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="textSecondary">
                          Height & Weight
                        </Typography>
                        <Typography variant="body1">
                          {medicalData.height ? `${medicalData.height} cm` : 'Not specified'}
                          {medicalData.weight ? ` • ${medicalData.weight} kg` : ''}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {medicalData.allergies && medicalData.allergies.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Allergies
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {medicalData.allergies.map((allergy, index) => (
                          <Chip key={index} label={allergy} size="small" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {medicalData.medications && medicalData.medications.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Current Medications
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {medicalData.medications.map((medication, index) => (
                          <Chip 
                            key={index} 
                            label={medication} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {medicalData.emergencyContact && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Emergency Contact
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="textSecondary">
                            Name
                          </Typography>
                          <Typography variant="body1">
                            {medicalData.emergencyContact.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="textSecondary">
                            Relationship
                          </Typography>
                          <Typography variant="body1">
                            {medicalData.emergencyContact.relationship}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="textSecondary">
                            Phone
                          </Typography>
                          <Typography variant="body1">
                            {medicalData.emergencyContact.phone}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {tabValue === 1 && user.role === 'doctor' && doctorData && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Professional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Doctor ID
                        </Typography>
                        <Typography variant="body1">
                          {doctorData.doctorId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Specialization
                        </Typography>
                        <Typography variant="body1">
                          {doctorData.specialization}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Experience
                        </Typography>
                        <Typography variant="body1">
                          {doctorData.experience} years
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Consultation Fee
                        </Typography>
                        <Typography variant="body1">
                          ${doctorData.consultationFee}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {doctorData.qualifications && doctorData.qualifications.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Qualifications
                      </Typography>
                      <Grid container spacing={2}>
                        {doctorData.qualifications.map((qual, index) => (
                          <Grid item xs={12} key={index}>
                            <Box display="flex" justifyContent="space-between">
                              <Box>
                                <Typography variant="body1">
                                  {qual.degree}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {qual.institute}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="textSecondary">
                                {qual.year}
                              </Typography>
                            </Box>
                            {index < doctorData.qualifications.length - 1 && <Divider sx={{ mt: 1 }} />}
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;