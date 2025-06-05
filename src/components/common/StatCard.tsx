import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  alpha,
  useTheme,
  Fade,
} from '@mui/material';
import { ArrowUpward } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  onClick?: () => void;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  onClick,
  delay = 0,
}) => {
  const theme = useTheme();

  return (
    <Fade in timeout={600 + delay}>
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
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default StatCard;