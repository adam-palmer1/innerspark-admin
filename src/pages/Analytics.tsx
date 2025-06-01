import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  TrendingUp,
  Category,
  Language,
} from '@mui/icons-material';
import { apiService } from '../services/api';

interface AnalyticsData {
  totalAffirmations: number;
  categoryCounts: { [key: string]: number };
  languageCounts: { [key: string]: number };
  averagePriority: number;
  recentActivity: any[];
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [affirmationsResponse] = await Promise.all([
          apiService.getAffirmations({ page: 1, limit: 1000 }),
          apiService.getAffirmationStats().catch(() => ({})),
        ]);

        const affirmations = affirmationsResponse.data;
        
        const categoryCounts: { [key: string]: number } = {};
        const languageCounts: { [key: string]: number } = {};
        let totalPriority = 0;

        affirmations.forEach((affirmation) => {
          if (affirmation.category) {
            categoryCounts[affirmation.category] = (categoryCounts[affirmation.category] || 0) + 1;
          }
          if (affirmation.language) {
            languageCounts[affirmation.language] = (languageCounts[affirmation.language] || 0) + 1;
          }
          if (affirmation.priority !== undefined) {
            totalPriority += affirmation.priority;
          }
        });

        setAnalytics({
          totalAffirmations: affirmations.length,
          categoryCounts,
          languageCounts,
          averagePriority: affirmations.length > 0 ? totalPriority / affirmations.length : 0,
          recentActivity: [],
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {typeof value === 'number' ? value.toFixed(1) : value}
            </Typography>
          </Box>
          <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info">
        No analytics data available
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Insights into your affirmations data
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Affirmations"
            value={analytics.totalAffirmations}
            icon={<BarChart sx={{ fontSize: 40 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Categories"
            value={Object.keys(analytics.categoryCounts).length}
            icon={<Category sx={{ fontSize: 40 }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Languages"
            value={Object.keys(analytics.languageCounts).length}
            icon={<Language sx={{ fontSize: 40 }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Priority"
            value={analytics.averagePriority}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Affirmations by Category
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(analytics.categoryCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, count]) => (
                        <TableRow key={category}>
                          <TableCell>{category}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Affirmations by Language
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Language</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(analytics.languageCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([language, count]) => (
                        <TableRow key={language}>
                          <TableCell>{language.toUpperCase()}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;