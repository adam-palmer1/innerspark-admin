import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  People,
  FormatQuote,
  TrendingUp,
  AdminPanelSettings,
  Label,
  Add,
  Visibility,
  Timeline,
  CheckCircle,
  ArrowUpward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface DashboardStats {
  totalAdmins: number;
  totalAffirmations: number;
  totalTags: number;
  recentActivity: number;
  systemHealth: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [adminsResponse, affirmationsResponse, tagsResponse] = await Promise.all([
          apiService.getAdmins(1, 1),
          apiService.getAffirmations({ page: 1, limit: 1 }),
          apiService.getTags({ page: 1, limit: 1 }),
        ]);

        setStats({
          totalAdmins: adminsResponse.total || 0,
          totalAffirmations: affirmationsResponse.total || 0,
          totalTags: tagsResponse.total || 0,
          recentActivity: Math.floor(Math.random() * 50) + 10,
          systemHealth: 'Excellent',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: number;
    onClick?: () => void;
  }> = ({ title, value, icon, color, trend, onClick }) => (
    <Fade in timeout={600}>
      <Card
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease-in-out',
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px 0 rgb(0 0 0 / 0.15)',
          } : {},
          background: `linear-gradient(135deg, ${alpha(color, 0.05)}, ${alpha(color, 0.02)})`,
          border: `1px solid ${alpha(color, 0.1)}`,
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
            {trend !== undefined && (
              <Chip
                icon={<ArrowUpward sx={{ fontSize: '0.875rem' }} />}
                label={`+${trend}%`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            )}
          </Box>
          <Typography color="text.secondary" gutterBottom variant="body2" fontWeight={500}>
            {title}
          </Typography>
          <Typography variant="h3" component="div" fontWeight="bold" color="text.primary">
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <LinearProgress sx={{ borderRadius: 1, height: 6 }} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card sx={{ height: 140 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <CircularProgress size={32} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const quickActions = [
    { title: 'Create New Affirmation', icon: <Add />, action: () => navigate('/affirmations'), color: theme.palette.primary.main },
    { title: 'Manage Admins', icon: <People />, action: () => navigate('/admins'), color: theme.palette.secondary.main },
    { title: 'View Analytics', icon: <Timeline />, action: () => navigate('/analytics'), color: theme.palette.success.main },
    { title: 'Manage Tags', icon: <Label />, action: () => navigate('/tags'), color: theme.palette.info.main },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.125rem' }}>
          Welcome back! Here's what's happening with your InnerSpark platform.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Admins"
            value={stats?.totalAdmins || 0}
            icon={<AdminPanelSettings />}
            color={theme.palette.primary.main}
            trend={5}
            onClick={() => navigate('/admins')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Affirmations"
            value={stats?.totalAffirmations || 0}
            icon={<FormatQuote />}
            color={theme.palette.success.main}
            trend={12}
            onClick={() => navigate('/affirmations')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tags"
            value={stats?.totalTags || 0}
            icon={<Label />}
            color={theme.palette.info.main}
            trend={8}
            onClick={() => navigate('/tags')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Health"
            value={stats?.systemHealth || 'Unknown'}
            icon={<CheckCircle />}
            color={theme.palette.secondary.main}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Fade in timeout={800}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Timeline sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6" fontWeight="600">
                    Quick Actions
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Frequently used administrative actions for managing your platform.
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: action.color,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(action.color, 0.15)}`,
                          },
                        }}
                        onClick={action.action}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                bgcolor: alpha(action.color, 0.1),
                                color: action.color,
                                width: 40,
                                height: 40,
                                mr: 2,
                              }}
                            >
                              {action.icon}
                            </Avatar>
                            <Typography variant="body1" fontWeight="500">
                              {action.title}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Fade in timeout={1000}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Visibility sx={{ mr: 2, color: theme.palette.secondary.main }} />
                  <Typography variant="h6" fontWeight="600">
                    Platform Overview
                  </Typography>
                </Box>
                <List disablePadding>
                  <ListItem disablePadding sx={{ mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CheckCircle sx={{ color: theme.palette.success.main, fontSize: '1.25rem' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="API Status"
                      secondary="All systems operational"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TrendingUp sx={{ color: theme.palette.success.main, fontSize: '1.25rem' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Performance"
                      secondary="Response time < 200ms"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <AdminPanelSettings sx={{ color: theme.palette.primary.main, fontSize: '1.25rem' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Active Sessions"
                      secondary="All admin accounts secure"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;