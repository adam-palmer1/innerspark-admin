import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Checkbox,
  alpha,
  useTheme,
} from '@mui/material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  width?: string | number;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  selectedIds?: string[];
  onSelectAll?: (selected: boolean) => void;
  onSelectOne?: (id: string) => void;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
  selectable?: boolean;
}

function DataTable<T>({
  columns,
  data,
  loading = false,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  getRowId,
  emptyMessage = 'No data found',
  selectable = false,
}: DataTableProps<T>) {
  const theme = useTheme();
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(event.target.checked);
    }
  };

  const handleSelectOne = (id: string) => {
    if (onSelectOne) {
      onSelectOne(id);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        overflow: 'auto',
        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
        boxShadow: 'none',
        maxWidth: '100%',
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox" sx={{ width: 50 }}>
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell
                key={column.id as string}
                align={column.align}
                sx={{
                  width: column.width,
                  minWidth: column.minWidth,
                  fontWeight: 600,
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                align="center"
                sx={{ py: 4 }}
              >
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((row, index) => {
              const rowId = getRowId ? getRowId(row) : index.toString();
              const isSelected = selectedIds.includes(rowId);

              return (
                <TableRow key={rowId}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectOne(rowId)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = column.id === 'actions' ? row : (row as any)[column.id];
                    return (
                      <TableCell key={column.id as string} align={column.align}>
                        {column.render ? column.render(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                align="center"
                sx={{ py: 4 }}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => {
          onRowsPerPageChange(parseInt(event.target.value, 10));
        }}
      />
    </TableContainer>
  );
}

export default DataTable;