import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  Alert,
  TextField,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { Admin, CreateAdminRequest, UpdateAdminRequest } from '../types';
import { apiService } from '../services/api';
import DataTable, { Column } from '../components/common/DataTable';
import StatusChip from '../components/common/StatusChip';
import SearchBar from '../components/common/SearchBar';
import { getIdFromRow } from '../utils/api';

const Admins: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<CreateAdminRequest & { id?: string }>({
    name: '',
    email: '',
    password: '',
  });

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdmins(page + 1, rowsPerPage, search);
      setAdmins(response.data || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admins');
      setAdmins([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    fetchAdmins();
  }, [page, rowsPerPage, search, fetchAdmins]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleOpenDialog = (admin?: Admin) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        id: admin.id?.toString() || '',
        name: admin.name,
        email: admin.email,
        password: '',
      });
    } else {
      setEditingAdmin(null);
      setFormData({ name: '', email: '', password: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editingAdmin) {
        const updateData: UpdateAdminRequest = {
          name: formData.name,
          email: formData.email,
        };
        await apiService.updateAdmin(editingAdmin.id?.toString() || '', updateData);
      } else {
        await apiService.createAdmin(formData as CreateAdminRequest);
      }
      handleCloseDialog();
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to save admin');
    }
  };

  const handleToggleActive = async (admin: Admin) => {
    try {
      const isActive = admin.isActive ?? false;
      if (isActive) {
        await apiService.deactivateAdmin(admin.id?.toString() || '');
      } else {
        await apiService.activateAdmin(admin.id?.toString() || '');
      }
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to update admin status');
    }
  };

  const handleDelete = async (adminId: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await apiService.deleteAdmin(adminId.toString());
        fetchAdmins();
      } catch (err: any) {
        setError(err.message || 'Failed to delete admin');
      }
    }
  };

  const columns: Column<Admin>[] = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    {
      id: 'isActive',
      label: 'Status',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            checked={row.isActive ?? false}
            onChange={() => handleToggleActive(row)}
            size="small"
          />
          <StatusChip
            isActive={row.isActive}
            sx={{ ml: 1 }}
            onClick={() => handleToggleActive(row)}
          />
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Box>
          <IconButton onClick={() => handleOpenDialog(row)} size="small">
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDelete(getIdFromRow(row))} size="small">
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Admin Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Admin
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Search admins..."
        sx={{ mb: 2 }}
      />

      <DataTable
        columns={columns}
        data={admins}
        loading={loading}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        getRowId={getIdFromRow}
        emptyMessage="No admins found"
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAdmin ? 'Edit Admin' : 'Create Admin'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {!editingAdmin && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAdmin ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admins;