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
  Autocomplete,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  DeleteSweep,
  Close,
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
  const [tagFilter, setTagFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAffirmation, setEditingAffirmation] = useState<Affirmation | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [formData, setFormData] = useState<CreateAffirmationRequest & { id?: string }>({
    text: '',
    tags: [],
    priority: 1,
    language: 'en',
  });

  const fetchAffirmations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getAffirmations({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        tag: tagFilter || undefined,
        language: languageFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      console.log('Affirmations response:', response);
      // Map affirmations to ensure they have an id field
      const mappedAffirmations = (response.data || []).map(a => ({
        ...a,
        id: a.id || a._id || ''
      }));
      setAffirmations(mappedAffirmations);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch affirmations');
      setAffirmations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, tagFilter, languageFilter, search]);

  const fetchAvailableTags = async () => {
    try {
      const tags = await apiService.getAffirmationTags();
      setAvailableTags(tags || []);
    } catch (err) {
      console.error('Failed to fetch tags');
      setAvailableTags([]);
    }
  };

  useEffect(() => {
    fetchAffirmations();
  }, [fetchAffirmations]);

  useEffect(() => {
    fetchAvailableTags();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (affirmation?: Affirmation) => {
    if (affirmation) {
      setEditingAffirmation(affirmation);
      setFormData({
        id: affirmation.id?.toString() || affirmation._id || '',
        text: affirmation.text || affirmation.slides?.[0]?.title || '',
        tags: affirmation.tags || [],
        priority: affirmation.priority || 1,
        language: affirmation.language || 'en',
      });
    } else {
      setEditingAffirmation(null);
      setFormData({
        text: '',
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
      tags: [],
      priority: 1,
      language: 'en',
    });
    setTagInputValue('');
  };

  const handleSubmit = async () => {
    try {
      if (editingAffirmation) {
        const updateData: UpdateAffirmationRequest = {
          text: formData.text,
          tags: formData.tags,
          priority: formData.priority,
          language: formData.language,
        };
        await apiService.updateAffirmation(editingAffirmation.id?.toString() || '', updateData);
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
    if (!affirmationId) {
      setError('Invalid affirmation ID');
      return;
    }
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
        await apiService.bulkDeleteAffirmations({ 
          affirmationIds: selectedIds.map(id => parseInt(id)) 
        });
        setSelectedIds([]);
        fetchAffirmations();
      } catch (err: any) {
        setError(err.message || 'Failed to delete affirmations');
      }
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(affirmations.map(a => (a.id || a._id || '').toString()));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (!id) return;
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
          <InputLabel>Tag</InputLabel>
          <Select
            value={tagFilter}
            label="Tag"
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {availableTags.map((tag) => (
              <MenuItem key={tag} value={tag}>{tag}</MenuItem>
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
                <TableRow key={affirmation.id || affirmation._id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(affirmation.id?.toString() || '')}
                      onChange={() => handleSelectOne(affirmation.id?.toString() || '')}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={affirmation.text || affirmation.slides?.[0]?.title || 'No text'}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {affirmation.text || affirmation.slides?.[0]?.title || 'No text'}
                      </Typography>
                    </Tooltip>
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
                    <IconButton onClick={() => handleDelete(affirmation.id?.toString() || '')} size="small">
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
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => {
                    const newTags = [...formData.tags];
                    newTags.splice(index, 1);
                    setFormData({ ...formData, tags: newTags });
                  }}
                  deleteIcon={<Close />}
                  size="small"
                />
              ))}
            </Box>
            <Autocomplete
              value={null}
              inputValue={tagInputValue}
              onInputChange={(event, newInputValue) => {
                setTagInputValue(newInputValue);
              }}
              onChange={(event, newValue) => {
                if (newValue && !formData.tags.includes(newValue)) {
                  setFormData({ ...formData, tags: [...formData.tags, newValue] });
                  setTagInputValue('');
                }
              }}
              options={availableTags.filter(tag => !formData.tags.includes(tag))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Type to search tags..."
                  size="small"
                  fullWidth
                />
              )}
              freeSolo
              onKeyDown={(event) => {
                if (event.key === 'Enter' && tagInputValue.trim() && !formData.tags.includes(tagInputValue.trim())) {
                  event.preventDefault();
                  setFormData({ ...formData, tags: [...formData.tags, tagInputValue.trim()] });
                  setTagInputValue('');
                }
              }}
            />
          </Box>
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