import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  DeleteSweep,
} from '@mui/icons-material';
import { Affirmation, CreateAffirmationRequest, UpdateAffirmationRequest } from '../types';
import { apiService } from '../services/api';

const Affirmations: React.FC = () => {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAffirmation, setEditingAffirmation] = useState<Affirmation | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateAffirmationRequest & { id?: string }>({
    text: '',
    category: '',
    tags: [],
    priority: 1,
    language: 'en',
  });

  const fetchAffirmations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getAffirmations(
        page + 1,
        rowsPerPage,
        categoryFilter,
        languageFilter,
        search
      );
      setAffirmations(response.data || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch affirmations');
      setAffirmations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, categoryFilter, languageFilter, search]);

  const fetchCategories = async () => {
    try {
      const cats = await apiService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchAffirmations();
  }, [fetchAffirmations]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (affirmation?: Affirmation) => {
    if (affirmation) {
      setEditingAffirmation(affirmation);
      setFormData({
        id: affirmation.id.toString(),
        text: affirmation.slides?.[0]?.title || affirmation.text || '',
        category: affirmation.category || '',
        tags: affirmation.tags || [],
        priority: affirmation.priority || 1,
        language: affirmation.language || 'en',
      });
    } else {
      setEditingAffirmation(null);
      setFormData({
        text: '',
        category: '',
        tags: [],
        priority: 1,
        language: 'en',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAffirmation(null);
    setFormData({
      text: '',
      category: '',
      tags: [],
      priority: 1,
      language: 'en',
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingAffirmation) {
        const updateData: UpdateAffirmationRequest = {
          text: formData.text,
          category: formData.category,
          tags: formData.tags,
          priority: formData.priority,
          language: formData.language,
        };
        await apiService.updateAffirmation(editingAffirmation.id.toString(), updateData);
      } else {
        await apiService.createAffirmation(formData as CreateAffirmationRequest);
      }
      handleCloseDialog();
      fetchAffirmations();
    } catch (err: any) {
      setError(err.message || 'Failed to save affirmation');
    }
  };

  const handleDelete = async (affirmationId: string) => {
    if (window.confirm('Are you sure you want to delete this affirmation?')) {
      try {
        await apiService.deleteAffirmation(affirmationId);
        fetchAffirmations();
      } catch (err: any) {
        setError(err.message || 'Failed to delete affirmation');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} affirmations?`)) {
      try {
        await apiService.bulkDeleteAffirmations(selectedIds);
        setSelectedIds([]);
        fetchAffirmations();
      } catch (err: any) {
        setError(err.message || 'Failed to delete affirmations');
      }
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(affirmations.map(a => a.id.toString()));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Affirmation Management</Typography>
        <Box>
          {selectedIds.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweep />}
              onClick={handleBulkDelete}
              sx={{ mr: 1 }}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Affirmation
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search affirmations..."
          value={search}
          onChange={handleSearch}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Language</InputLabel>
          <Select
            value={languageFilter}
            label="Language"
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.length > 0 && selectedIds.length < affirmations.length}
                  checked={affirmations.length > 0 && selectedIds.length === affirmations.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Text</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : affirmations && affirmations.length > 0 ? (
              affirmations.map((affirmation) => (
                <TableRow key={affirmation.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(affirmation.id.toString())}
                      onChange={() => handleSelectOne(affirmation.id.toString())}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={affirmation.slides?.[0]?.title || affirmation.text || 'No text'}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {affirmation.slides?.[0]?.title || affirmation.text || 'No text'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {affirmation.category && <Chip label={affirmation.category} size="small" />}
                  </TableCell>
                  <TableCell>
                    {affirmation.tags?.map((tag) => (
                      <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>{affirmation.priority || '-'}</TableCell>
                  <TableCell>{affirmation.language?.toUpperCase() || '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(affirmation)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(affirmation.id.toString())} size="small">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No affirmations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAffirmation ? 'Edit Affirmation' : 'Create Affirmation'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            variant="outlined"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Tags (comma-separated)"
            fullWidth
            variant="outlined"
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData({ 
              ...formData, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
            })}
          />
          <TextField
            margin="dense"
            label="Priority"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
            inputProps={{ min: 1, max: 10 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Language</InputLabel>
            <Select
              value={formData.language}
              label="Language"
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAffirmation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Affirmations;