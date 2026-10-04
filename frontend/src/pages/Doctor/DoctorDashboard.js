import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  TrendingUp,
  MedicalServices,
  Schedule,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, isToday, parseISO } from 'date-fns';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedToday: 0,
    totalPatients: 0,
    completionRate: 0
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [doctorRes, appointmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/doctors/me'),
        axios.get('http://localhost:5000/api/appointments/doctor', {
          params: { date: format(new Date(), 'yyyy-MM-dd') }
        })
      ]);

      const doctor = doctorRes.data.doctor;
      const appointments = appointmentsRes.data.appointments || [];
      
      // Calculate stats
      const todayAppts = appointments.filter(apt => 
        apt.status === 'scheduled' || apt.status === 'confirmed'
      );
      
      const completedToday = appointments.filter(
        apt => apt.status === 'completed'
      ).length;

      const totalPatients = doctor?.currentPatients?.length || 0;
      const completionRate = todayAppts.length > 0 
        ? Math.round((completedToday / todayAppts.length) * 100) 
        : 0;

      setDoctorInfo(doctor);
      setStats({
        todayAppointments: todayAppts.length,
        completedToday,
        totalPatients,
        completionRate
      });

      // Format today's schedule
      const formattedSchedule = todayAppts.map(apt => ({
        id: apt._id,
        time: apt.appointmentTime,
        patient: apt.patient?.patientId || 'Unknown',
        status: apt.status,
        type: apt.appointmentType,
        symptoms: apt.symptoms
      }));

      setTodaySchedule(formattedSchedule);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'confirmed': return 'primary';
      default: return 'default';
    }
  };

  const handleViewAppointment = (appointmentId) => {
    navigate(`/appointments/${appointmentId}`);
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Doctor Dashboard
      </Typography>

      {/* Welcome Card */}
      {doctorInfo && (
        <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'white', color: 'primary.main' }}>
                  <MedicalServices fontSize="large" />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" gutterBottom>
                  Welcome, Dr. {doctorInfo.user?.profile?.firstName} {doctorInfo.user?.profile?.lastName}
                </Typography>
                <Typography variant="body1">
                  {doctorInfo.specialization} • {doctorInfo.experience} years experience
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Consultation Fee: ${doctorInfo.consultationFee}
                </Typography>
              </Grid>
              <Grid item>
                <Chip 
                  label={doctorInfo.isOnLeave ? 'On Leave' : 'Available'} 
                  color={doctorInfo.isOnLeave ? 'warning' : 'success'}
                  sx={{ color: 'white' }}
                />
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Today's Appointments
                  </Typography>
                  <Typography variant="h4">
                    {stats.todayAppointments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <CalendarToday />
                </Avatar>
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => navigate('/doctor/appointments')}
              >
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed Today
                  </Typography>
                  <Typography variant="h4">
                    {stats.completedToday}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Patients
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalPatients}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <Person />
                </Avatar>
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => navigate('/doctor/patients')}
              >
                View Patients
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="h4">
                    {stats.completionRate}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Schedule */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Today's Schedule ({format(new Date(), 'MMMM d, yyyy')})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={() => navigate('/doctor/schedule')}
              >
                Manage Schedule
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {todaySchedule.length === 0 ? (
              <Typography color="textSecondary" textAlign="center" py={4}>
                No appointments scheduled for today
              </Typography>
            ) : (
              <List>
                {todaySchedule.map((appointment, index) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem
                      secondaryAction={
                        <Button
                          size="small"
                          onClick={() => handleViewAppointment(appointment.id)}
                        >
                          View
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <AccessTime />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${appointment.time} - Patient ${appointment.patient}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                            </Typography>
                            {appointment.symptoms && ` • ${appointment.symptoms.substring(0, 50)}...`}
                          </>
                        }
                      />
                      <Chip
                        label={appointment.status}
                        size="small"
                        color={getStatusColor(appointment.status)}
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                    {index < todaySchedule.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<CalendarToday />}
                onClick={() => navigate('/doctor/appointments')}
              >
                View Appointments
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Person />}
                onClick={() => navigate('/doctor/patients')}
              >
                View Patients
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Schedule />}
                onClick={() => navigate('/doctor/schedule')}
              >
                Update Availability
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MedicalServices />}
                onClick={() => navigate('/profile')}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorDashboard;