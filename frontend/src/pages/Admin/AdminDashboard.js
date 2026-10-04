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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  People,
  LocalHospital,
  CalendarToday,
  TrendingUp,
  AttachMoney,
  Warning,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    revenue: 0,
    pendingAppointments: 0,
    availableDoctors: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, you would have dedicated API endpoints for these stats
      const [patientsRes, doctorsRes, appointmentsRes, departmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/patients'),
        axios.get('http://localhost:5000/api/doctors'),
        axios.get('http://localhost:5000/api/appointments/doctor'),
        axios.get('http://localhost:5000/api/departments/statistics')
      ]);

      const patients = patientsRes.data.patients || [];
      const doctors = doctorsRes.data.doctors || [];
      const appointments = appointmentsRes.data.appointments || [];
      
      // Calculate stats
      const availableDoctors = doctors.filter(d => !d.isOnLeave).length;
      const pendingAppointments = appointments.filter(a => 
        a.status === 'scheduled'
      ).length;
      
      // Calculate revenue (simplified - in real app, use actual billing data)
      const completedAppointments = appointments.filter(a => 
        a.status === 'completed'
      ).length;
      const averageFee = doctors.reduce((sum, doc) => sum + (doc.consultationFee || 0), 0) / doctors.length || 0;
      const estimatedRevenue = Math.round(completedAppointments * averageFee);

      setStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalAppointments: appointments.length,
        revenue: estimatedRevenue,
        pendingAppointments,
        availableDoctors
      });

      // Get recent activities (simplified)
      const activities = appointments
        .slice(0, 5)
        .map(apt => ({
          id: apt._id,
          type: 'appointment',
          description: `New appointment with ${apt.patient?.patientId || 'patient'}`,
          time: new Date(apt.createdAt),
          status: apt.status
        }));

      setRecentActivities(activities);

      // Get upcoming appointments
      const today = new Date();
      const upcoming = appointments
        .filter(apt => new Date(apt.appointmentDate) >= today && apt.status === 'scheduled')
        .slice(0, 5)
        .map(apt => ({
          id: apt._id,
          patientId: apt.patient?.patientId,
          doctor: apt.doctor?.user?.profile
            ? `Dr. ${apt.doctor.user.profile.firstName} ${apt.doctor.user.profile.lastName}`
            : 'Unknown Doctor',
          date: format(new Date(apt.appointmentDate), 'MMM dd'),
          time: apt.appointmentTime,
          type: apt.appointmentType
        }));

      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Patients
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalPatients}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/admin/patients')}>
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Doctors
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalDoctors}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                  <LocalHospital />
                </Avatar>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/admin/doctors')}>
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Appointments
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalAppointments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                  <CalendarToday />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Estimated Revenue
                  </Typography>
                  <Typography variant="h5">
                    ${stats.revenue.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Appointments
                  </Typography>
                  <Typography variant="h5">
                    {stats.pendingAppointments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40 }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Available Doctors
                  </Typography>
                  <Typography variant="h5">
                    {stats.availableDoctors}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities and Upcoming Appointments */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Activity</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((activity) => (
                    <TableRow key={activity.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {activity.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {format(activity.time, 'hh:mm a')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={
                            activity.status === 'completed' ? 'success' :
                            activity.status === 'cancelled' ? 'error' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Upcoming Appointments
              </Typography>
              <Button
                size="small"
                startIcon={<Schedule />}
                onClick={() => navigate('/admin/appointments')}
              >
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Date/Time</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingAppointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {appointment.patientId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {appointment.doctor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {appointment.date} {appointment.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<LocalHospital />}
                  onClick={() => navigate('/admin/doctors')}
                >
                  Manage Doctors
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  onClick={() => navigate('/admin/patients')}
                >
                  Manage Patients
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  onClick={() => navigate('/admin/appointments')}
                >
                  View Appointments
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/admin/reports')}
                >
                  Generate Reports
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  onClick={() => navigate('/admin/billing')}
                >
                  Billing
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;