import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tab,
  Tabs,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday,
  Cancel,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/Common/DataTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { appointmentAPI } from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    diagnosis: '',
    prescription: [],
    notes: '',
    followUpDate: ''
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [tabValue]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user.role === 'patient') {
        response = await appointmentAPI.getPatientAppointments();
      } else if (user.role === 'doctor') {
        const statusFilter = tabValue === 0 ? 'scheduled' : 
                           tabValue === 1 ? 'confirmed' : 
                           tabValue === 2 ? 'completed' : 'cancelled';
        response = await appointmentAPI.getDoctorAppointments({ 
          status: statusFilter === 'all' ? null : statusFilter 
        });
      }
      
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status,
      diagnosis: appointment.diagnosis || '',
      prescription: appointment.prescription || [],
      notes: appointment.notes || '',
      followUpDate: appointment.followUpDate || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
    setFormData({
      status: '',
      diagnosis: '',
      prescription: [],
      notes: '',
      followUpDate: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateAppointment = async () => {
    try {
      if (!selectedAppointment) return;
      
      await appointmentAPI.updateAppointment(selectedAppointment._id, formData);
      
      toast.success('Appointment updated successfully');
      fetchAppointments();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancelAppointment(appointmentId);
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const columns = [
    {
      field: 'appointmentDate',
      headerName: 'Date',
      type: 'date',
      width: 120,
      render: (value) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      field: 'appointmentTime',
      headerName: 'Time',
      width: 100
    },
    {
      field: user.role === 'patient' ? 'doctor' : 'patient',
      headerName: user.role === 'patient' ? 'Doctor' : 'Patient',
      width: 200,
      render: (value) => {
        if (user.role === 'patient') {
          return value?.user?.profile 
            ? `Dr. ${value.user.profile.firstName} ${value.user.profile.lastName}`
            : 'Unknown Doctor';
        } else {
          return value?.patientId || 'Unknown Patient';
        }
      }
    },
    {
      field: user.role === 'patient' ? 'doctor' : 'patient',
      headerName: user.role === 'patient' ? 'Specialization' : 'Contact',
      width: 150,
      render: (value) => {
        if (user.role === 'patient') {
          return value?.specialization || '-';
        } else {
          return value?.user?.profile?.phone || '-';
        }
      }
    },
    {
      field: 'appointmentType',
      headerName: 'Type',
      width: 120,
      render: (value) => (
        <Chip
          label={value}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      render: (value) => {
        const colors = {
          scheduled: 'warning',
          confirmed: 'info',
          completed: 'success',
          cancelled: 'error',
          'no-show': 'default'
        };
        
        return (
          <Chip
            label={value}
            size="small"
            color={colors[value] || 'default'}
          />
        );
      }
    },
    {
      field: 'symptoms',
      headerName: 'Symptoms/Notes',
      width: 200,
      render: (value) => value ? `${value.substring(0, 50)}...` : '-'
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    if (user.role === 'doctor') {
      const statusFilter = tabValue === 0 ? 'scheduled' : 
                         tabValue === 1 ? 'confirmed' : 
                         tabValue === 2 ? 'completed' : 
                         tabValue === 3 ? 'cancelled' : 'all';
      return statusFilter === 'all' || appointment.status === statusFilter;
    }
    return true;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Appointments
          </Typography>
          
          {user.role === 'patient' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/patient/book-appointment')}
            >
              Book Appointment
            </Button>
          )}
        </Box>

        {user.role === 'doctor' && (
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Scheduled" />
              <Tab label="Confirmed" />
              <Tab label="Completed" />
              <Tab label="Cancelled" />
            </Tabs>
          </Paper>
        )}

        {loading ? (
          <LoadingSpinner message="Loading appointments..." />
        ) : (
          <DataTable
            columns={columns}
            data={filteredAppointments.map(apt => ({ ...apt, id: apt._id }))}
            page={0}
            rowsPerPage={10}
            totalRows={filteredAppointments.length}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            onView={(row) => navigate(`/appointments/${row.id}`)}
            onEdit={(row) => user.role === 'doctor' && handleOpenDialog(row)}
            onDelete={(row) => user.role === 'patient' && handleCancelAppointment(row.id)}
            actions={true}
          />
        )}
      </Box>

      {/* Update Appointment Dialog (for doctors) */}
      {user.role === 'doctor' && selectedAppointment && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Update Appointment
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="no-show">No Show</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Follow-up Date"
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Diagnosis"
                  name="diagnosis"
                  multiline
                  rows={3}
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or recommendations..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleUpdateAppointment} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Appointments;