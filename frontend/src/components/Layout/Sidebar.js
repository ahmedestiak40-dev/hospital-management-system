import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import {
  Dashboard,
  Person,
  LocalHospital,
  CalendarToday,
  Group,
  Settings,
  Assignment,
  History,
  Home,
  AdminPanelSettings,
  MedicalServices
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, onClose, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const drawer = (
    <div>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            mr: 2
          }}
        >
          <LocalHospital />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            Hospital HMS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
          </Typography>
        </Box>
      </Box>
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/'}
            onClick={() => navigate('/')}
          >
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        {/* Patient Menu */}
        {userRole === 'patient' && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/patient/book-appointment')}
                onClick={() => navigate('/patient/book-appointment')}
              >
                <ListItemIcon>
                  <CalendarToday />
                </ListItemIcon>
                <ListItemText primary="Book Appointment" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/patient/appointments')}
                onClick={() => navigate('/patient/appointments')}
              >
                <ListItemIcon>
                  <Assignment />
                </ListItemIcon>
                <ListItemText primary="My Appointments" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/patient/medical-history')}
                onClick={() => navigate('/patient/medical-history')}
              >
                <ListItemIcon>
                  <History />
                </ListItemIcon>
                <ListItemText primary="Medical History" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* Doctor Menu */}
        {userRole === 'doctor' && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/doctor/appointments')}
                onClick={() => navigate('/doctor/appointments')}
              >
                <ListItemIcon>
                  <CalendarToday />
                </ListItemIcon>
                <ListItemText primary="Today's Appointments" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/doctor/patients')}
                onClick={() => navigate('/doctor/patients')}
              >
                <ListItemIcon>
                  <Group />
                </ListItemIcon>
                <ListItemText primary="My Patients" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/doctor/schedule')}
                onClick={() => navigate('/doctor/schedule')}
              >
                <ListItemIcon>
                  <Assignment />
                </ListItemIcon>
                <ListItemText primary="Schedule" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* Admin Menu */}
        {userRole === 'admin' && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/admin/doctors')}
                onClick={() => navigate('/admin/doctors')}
              >
                <ListItemIcon>
                  <MedicalServices />
                </ListItemIcon>
                <ListItemText primary="Doctors" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/admin/patients')}
                onClick={() => navigate('/admin/patients')}
              >
                <ListItemIcon>
                  <Group />
                </ListItemIcon>
                <ListItemText primary="Patients" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/admin/departments')}
                onClick={() => navigate('/admin/departments')}
              >
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary="Departments" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/admin/users')}
                onClick={() => navigate('/admin/users')}
              >
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname.includes('/admin/settings')}
                onClick={() => navigate('/admin/settings')}
              >
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* Common Menu Items */}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname.includes('/profile')}
            onClick={() => navigate('/profile')}
          >
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>

        {userRole === 'admin' && (
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname.includes('/admin/settings')}
              onClick={() => navigate('/admin/settings')}
            >
              <ListItemIcon>
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText primary="Admin Panel" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;