import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

interface StatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  showIcon?: boolean;
}

const StatusChip: React.FC<StatusChipProps> = ({
  isActive,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  showIcon = true,
  ...chipProps
}) => {
  return (
    <Chip
      icon={showIcon ? (isActive ? <CheckCircle /> : <RadioButtonUnchecked />) : undefined}
      label={isActive ? activeLabel : inactiveLabel}
      color={isActive ? 'success' : 'default'}
      size="small"
      sx={{
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.8,
        },
      }}
      {...chipProps}
    />
  );
};

export default StatusChip;