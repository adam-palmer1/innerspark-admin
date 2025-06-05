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
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade,
  Skeleton,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  DeleteSweep,
  Close,
  FormatQuote,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Update,
  CheckCircle,
  RadioButtonUnchecked,
  Analytics,
  AutoAwesome,
} from '@mui/icons-material';
import Rating from '@mui/material/Rating';
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
  const theme = useTheme();
  const [tagFilter, setTagFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | ''>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [editingAffirmation, setEditingAffirmation] = useState<Affirmation | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showConfirmAI, setShowConfirmAI] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [aiRating, setAiRating] = useState<number>(0);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [userEditedFields, setUserEditedFields] = useState<Set<string>>(new Set());

  const handleFieldChange = (fieldName: string, value: string) => {
    // Only remove trailing periods from affirmationTitle and affirmationContent
    const cleanedValue = (fieldName === 'affirmationTitle' || fieldName === 'affirmationContent') 
      ? value.replace(/\.+$/, '') 
      : value;
    
    setFormData({ ...formData, [fieldName]: cleanedValue });
    
    // Always update userEditedFields based on whether the field is empty or not
    if (cleanedValue.trim()) {
      // Field has content - add to userEditedFields
      setUserEditedFields(prev => new Set(prev).add(fieldName));
    } else {
      // Field is empty - remove from userEditedFields (removes green border)
      setUserEditedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && !saving) {
      // Prevent default form submission
      event.preventDefault();
      // Submit the form
      handleSubmit();
    }
  };

  const getFieldSx = (fieldName: string) => {
    // Only show green border if field is in userEditedFields AND has content
    const fieldValue = (formData as any)[fieldName];
    if (userEditedFields.has(fieldName) && fieldValue && fieldValue.trim()) {
      return {
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'success.main',
            borderWidth: 2,
          },
          '&:hover fieldset': {
            borderColor: 'success.main',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'success.main',
          },
        },
      };
    }
    return undefined;
  };
  const [formData, setFormData] = useState<CreateAffirmationRequest & { id?: string }>({
    tags: [],
    language: 'en',
    isActive: true,
    author: '',
    affirmationTitle: '',
    affirmationContent: '',
    descriptionContent: '',
    practiceContent1: '',
    practiceContent2: '',
    practiceContent3: '',
  });
  const [bulkData, setBulkData] = useState({
    isActive: true,
    tags: [] as string[],
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
        isActive: isActiveFilter !== '' ? isActiveFilter : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
      // Map affirmations to ensure they have an id field and convert tagObjects to tags
      const mappedAffirmations = (response.data || []).map(a => {
        // Convert tagObjects to tags array
        let tags: string[] = [];
        if (a.tagObjects && Array.isArray(a.tagObjects)) {
          tags = a.tagObjects.map((tagObj: any) => tagObj.name);
        } else if (a.tags && Array.isArray(a.tags)) {
          tags = a.tags;
        }
        
        const mapped = {
          ...a,
          id: a.id || parseInt(a._id || '0') || 0,
          tags: tags
        };
        return mapped;
      });
      setAffirmations(mappedAffirmations);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch affirmations');
      setAffirmations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, tagFilter, languageFilter, search, isActiveFilter, sortBy, sortOrder]);

  const fetchAvailableTags = async () => {
    try {
      const tags = await apiService.getAffirmationTags();
      setAvailableTags(tags || []);
    } catch (err) {
      console.error('Failed to fetch tags');
      setAvailableTags([]);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await apiService.getAffirmationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    fetchAffirmations();
    fetchStats();
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
        tags: affirmation.tags || [],
        language: affirmation.language || 'en',
        isActive: affirmation.isActive ?? true,
        author: affirmation.author || '',
        affirmationTitle: affirmation.affirmationTitle || '',
        affirmationContent: affirmation.affirmationContent || '',
        descriptionContent: affirmation.descriptionContent || '',
        practiceContent1: affirmation.practiceContent1 || '',
        practiceContent2: affirmation.practiceContent2 || '',
        practiceContent3: affirmation.practiceContent3 || '',
      });
      // Don't automatically mark existing content as user-edited
      // Only fields that the user actually edits will get green borders
      setUserEditedFields(new Set());
    } else {
      setEditingAffirmation(null);
      setFormData({
        tags: [],
        language: 'en',
        isActive: true,
        author: '',
        affirmationTitle: '',
        affirmationContent: '',
        descriptionContent: '',
        practiceContent1: '',
        practiceContent2: '',
        practiceContent3: '',
      });
      setUserEditedFields(new Set());
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAffirmation(null);
    setFormData({
      tags: [],
      language: 'en',
      isActive: true,
      author: '',
      affirmationTitle: '',
      affirmationContent: '',
      descriptionContent: '',
      practiceContent1: '',
      practiceContent2: '',
      practiceContent3: '',
    });
    setTagInputValue('');
    setSuccessMessage('');
    setError('');
    setAiGenerated(false);
    setAiRating(0);
    setAiFeedback('');
    setUserEditedFields(new Set());
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.tags || formData.tags.length === 0) {
      setError('At least one tag is required');
      return;
    }
    
    try {
      setSaving(true);
      
      // Submit feedback if this was AI generated and rated
      if (aiGenerated && aiRating > 0) {
        try {
          await apiService.submitFeedback({
            rating: aiRating,
            feedback: aiFeedback || undefined,
            generatedContent: {
              affirmationTitle: formData.affirmationTitle || '',
              affirmationContent: formData.affirmationContent || '',
              descriptionContent: formData.descriptionContent || '',
              practiceContent1: formData.practiceContent1 || '',
              practiceContent2: formData.practiceContent2 || '',
              practiceContent3: formData.practiceContent3 || '',
            },
            tags: formData.tags,
            language: formData.language,
          });
        } catch (feedbackErr) {
          console.error('Failed to submit feedback:', feedbackErr);
          // Continue with creation even if feedback fails
        }
      }
      
      if (editingAffirmation) {
        const updateData: UpdateAffirmationRequest = {
          tags: formData.tags,
          language: formData.language,
          isActive: formData.isActive,
          author: formData.author,
          affirmationTitle: formData.affirmationTitle,
          affirmationContent: formData.affirmationContent,
          descriptionContent: formData.descriptionContent,
          practiceContent1: formData.practiceContent1,
          practiceContent2: formData.practiceContent2,
          practiceContent3: formData.practiceContent3,
        };
        await apiService.updateAffirmation(editingAffirmation.id?.toString() || '', updateData);
        handleCloseDialog();
      } else {
        await apiService.createAffirmation(formData as CreateAffirmationRequest);
        // Keep dialog open and show success message
        setSuccessMessage('Affirmation created successfully!');
        // Clear form but keep tags and author
        const currentTags = formData.tags;
        const currentAuthor = formData.author;
        setFormData({
          tags: currentTags,
          language: 'en',
          isActive: true,
          author: currentAuthor,
          affirmationTitle: '',
          affirmationContent: '',
          descriptionContent: '',
          practiceContent1: '',
          practiceContent2: '',
          practiceContent3: '',
        });
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      fetchAffirmations();
      fetchStats();
    } catch (err: any) {
      setError(err.message || 'Failed to save affirmation');
    } finally {
      setSaving(false);
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

  const handleToggleStatus = async (affirmationId: string) => {
    try {
      await apiService.toggleAffirmationStatus(affirmationId);
      fetchAffirmations();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle affirmation status');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await apiService.bulkUpdateAffirmations({
        affirmationIds: selectedIds.map(id => parseInt(id)),
        updateData: bulkData
      });
      setSelectedIds([]);
      setOpenBulkDialog(false);
      fetchAffirmations();
    } catch (err: any) {
      setError(err.message || 'Failed to update affirmations');
    }
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('ASC');
    }
    setPage(0);
  };

  const hasExistingContent = () => {
    // Only check fields that would actually be overwritten (not user-edited fields with green borders)
    return !!(
      (formData.affirmationTitle && !userEditedFields.has('affirmationTitle')) ||
      (formData.affirmationContent && !userEditedFields.has('affirmationContent')) ||
      (formData.descriptionContent && !userEditedFields.has('descriptionContent')) ||
      (formData.practiceContent1 && !userEditedFields.has('practiceContent1')) ||
      (formData.practiceContent2 && !userEditedFields.has('practiceContent2')) ||
      (formData.practiceContent3 && !userEditedFields.has('practiceContent3'))
    );
  };

  const handleGenerateAI = async () => {
    if (!formData.tags || formData.tags.length === 0) {
      setError('Please add at least one tag before generating AI content');
      return;
    }

    if (hasExistingContent()) {
      setShowConfirmAI(true);
      return;
    }

    await generateAIContent();
  };

  const generateAIContent = async () => {
    try {
      setGeneratingAI(true);
      setError('');
      setSuccessMessage('');
      
      // Pass existing user data to the API
      const generated = await apiService.generateAIAffirmation({
        tags: formData.tags,
        language: formData.language,
        affirmationTitle: formData.affirmationTitle || undefined,
        affirmationContent: formData.affirmationContent || undefined,
        descriptionContent: formData.descriptionContent || undefined,
        practiceContent1: formData.practiceContent1 || undefined,
        practiceContent2: formData.practiceContent2 || undefined,
        practiceContent3: formData.practiceContent3 || undefined,
      });
      
      // Only preserve fields that have been user-edited (green borders)
      // All other fields get replaced with AI-generated content
      setFormData(prev => ({
        ...prev,
        affirmationTitle: userEditedFields.has('affirmationTitle') ? prev.affirmationTitle : generated.affirmationTitle,
        affirmationContent: userEditedFields.has('affirmationContent') ? prev.affirmationContent : generated.affirmationContent,
        descriptionContent: userEditedFields.has('descriptionContent') ? prev.descriptionContent : generated.descriptionContent,
        practiceContent1: userEditedFields.has('practiceContent1') ? prev.practiceContent1 : generated.practiceContent1,
        practiceContent2: userEditedFields.has('practiceContent2') ? prev.practiceContent2 : generated.practiceContent2,
        practiceContent3: userEditedFields.has('practiceContent3') ? prev.practiceContent3 : generated.practiceContent3,
      }));
      
      setShowConfirmAI(false);
      setSuccessMessage('AI content generated successfully!');
      setAiGenerated(true);
      setAiRating(0);
      setAiFeedback('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI content');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleConfirmAIGeneration = async () => {
    await generateAIContent();
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <FormatQuote sx={{ mr: 2, color: theme.palette.primary.main, fontSize: '2rem' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Affirmations
            </Typography>
            <Skeleton variant="text" width={300} />
          </Box>
        </Box>
        <Card>
          <CardContent>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Fade in timeout={600}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <FormatQuote sx={{ mr: 2, color: theme.palette.primary.main, fontSize: '2rem' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Affirmations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage inspirational affirmations for your users
            </Typography>
          </Box>
        </Box>
      </Fade>

      {stats && (
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.02)})` }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Analytics sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {stats.totalAffirmations || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Affirmations
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)}, ${alpha(theme.palette.success.main, 0.02)})` }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {stats.activeAffirmations || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Affirmations
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <FormatQuote sx={{ fontSize: 40, color: theme.palette.secondary.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="secondary.main">
                      {stats.tagsCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unique Tags
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="600">
              Affirmation Library ({total})
            </Typography>
            <Box>
              {selectedIds.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Update />}
                    onClick={() => setOpenBulkDialog(true)}
                    sx={{ 
                      mr: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Update Selected ({selectedIds.length})
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteSweep />}
                    onClick={handleBulkDelete}
                    sx={{ 
                      mr: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Delete Selected ({selectedIds.length})
                  </Button>
                </>
              )}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px 0 rgb(0 0 0 / 0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px 0 rgb(0 0 0 / 0.2)',
                  },
                }}
              >
                Add Affirmation
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <Stack spacing={3} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                variant="outlined"
                placeholder="Search affirmations..."
                value={search}
                onChange={handleSearch}
                sx={{ 
                  flexGrow: 1,
                  minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={isActiveFilter === '' ? '' : isActiveFilter ? 'true' : 'false'}
                  label="Status"
                  onChange={(e) => {
                    const value = e.target.value;
                    setIsActiveFilter(value === '' ? '' : value === 'true');
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Tag</InputLabel>
                <Select
                  value={tagFilter}
                  label="Tag"
                  onChange={(e) => setTagFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Tags</MenuItem>
                  {availableTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={languageFilter}
                  label="Language"
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Languages</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Sort by:
              </Typography>
              <Stack direction="row" spacing={1}>
                {[
                  { label: 'Created', value: 'createdAt' },
                  { label: 'Title', value: 'affirmationTitle' },
                  { label: 'Language', value: 'language' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleSortChange(option.value)}
                    endIcon={
                      sortBy === option.value ? (
                        sortOrder === 'ASC' ? <ArrowUpward /> : <ArrowDownward />
                      ) : (
                        <Sort />
                      )
                    }
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Stack>

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
              <TableCell padding="checkbox" sx={{ width: 50 }}>
                <Checkbox
                  indeterminate={selectedIds.length > 0 && selectedIds.length < affirmations.length}
                  checked={affirmations.length > 0 && selectedIds.length === affirmations.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ width: '35%', minWidth: 200 }}>Title/Content</TableCell>
              <TableCell sx={{ width: 100 }}>Status</TableCell>
              <TableCell sx={{ width: '25%', minWidth: 150 }}>Tags</TableCell>
              <TableCell sx={{ width: 90 }}>Language</TableCell>
              <TableCell sx={{ width: 120 }}>Author</TableCell>
              <TableCell sx={{ width: 100 }}>Actions</TableCell>
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
                  <TableCell sx={{ maxWidth: 0 }}>
                    <Tooltip title={affirmation.affirmationTitle || affirmation.affirmationContent || 'No content'}>
                      <Box sx={{ width: '100%' }}>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ 
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {affirmation.affirmationTitle || 'No title'}
                        </Typography>
                        {affirmation.affirmationContent && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            noWrap 
                            sx={{ 
                              width: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'block',
                            }}
                          >
                            {affirmation.affirmationContent}
                          </Typography>
                        )}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={affirmation.isActive ? <CheckCircle /> : <RadioButtonUnchecked />}
                      label={affirmation.isActive ? 'Active' : 'Inactive'}
                      color={affirmation.isActive ? 'success' : 'default'}
                      size="small"
                      onClick={() => handleToggleStatus(affirmation.id?.toString() || '')}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 0 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.5,
                      width: '100%',
                      overflow: 'hidden',
                    }}>
                      {affirmation.tags && affirmation.tags.length > 0 ? (
                        affirmation.tags.slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">No tags</Typography>
                      )}
                      {affirmation.tags && affirmation.tags.length > 3 && (
                        <Chip 
                          label={`+${affirmation.tags.length - 3}`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{affirmation.language?.toUpperCase() || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      noWrap
                      sx={{
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={affirmation.author || '-'}
                    >
                      {affirmation.author || '-'}
                    </Typography>
                  </TableCell>
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
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth onKeyDown={handleKeyDown}>
        <DialogTitle>
          {editingAffirmation ? 'Edit Affirmation' : 'Create Affirmation'}
        </DialogTitle>
        <DialogContent>
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }} 
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            * Required fields
          </Typography>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Tags *
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
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={handleGenerateAI}
                disabled={generatingAI || !formData.tags || formData.tags.length === 0}
                sx={{
                  bgcolor: 'secondary.main',
                  '&:hover': { bgcolor: 'secondary.dark' },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {generatingAI ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                    Generating...
                  </>
                ) : (
                  'Generate with AI'
                )}
              </Button>
            </Box>
          </Box>
          {aiGenerated && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Rate this AI-generated affirmation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your feedback helps improve future generations
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>Rating:</Typography>
                <Rating
                  value={aiRating}
                  onChange={(event, newValue) => setAiRating(newValue || 0)}
                  size="large"
                />
              </Box>
              <TextField
                label="Feedback (Optional)"
                multiline
                rows={2}
                value={aiFeedback}
                onChange={(e) => setAiFeedback(e.target.value)}
                placeholder="What could be improved? What worked well?"
                fullWidth
                variant="outlined"
                size="small"
              />
            </Box>
          )}
          <FormControl fullWidth margin="dense">
            <InputLabel>Language (Optional)</InputLabel>
            <Select
              value={formData.language}
              label="Language (Optional)"
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Affirmation Content (Optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={formData.affirmationContent}
            onChange={(e) => handleFieldChange('affirmationContent', e.target.value)}
            sx={getFieldSx('affirmationContent')}
          />
          <TextField
            margin="dense"
            label="Author (Optional)"
            fullWidth
            variant="outlined"
            value={formData.author}
            onChange={(e) => handleFieldChange('author', e.target.value)}
            inputProps={{ maxLength: 100 }}
            helperText="Maximum 100 characters"
            sx={getFieldSx('author')}
          />
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Additional Content Fields (Optional)</Typography>
          <TextField
            margin="dense"
            label="Affirmation Title (Optional)"
            fullWidth
            variant="outlined"
            value={formData.affirmationTitle}
            onChange={(e) => handleFieldChange('affirmationTitle', e.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText="Maximum 500 characters"
            sx={getFieldSx('affirmationTitle')}
          />
          <TextField
            margin="dense"
            label="Description Content (Optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={formData.descriptionContent}
            onChange={(e) => handleFieldChange('descriptionContent', e.target.value)}
            sx={getFieldSx('descriptionContent')}
          />
          <TextField
            margin="dense"
            label="Practice Content 1 (Optional)"
            fullWidth
            variant="outlined"
            value={formData.practiceContent1}
            onChange={(e) => handleFieldChange('practiceContent1', e.target.value)}
            sx={getFieldSx('practiceContent1')}
          />
          <TextField
            margin="dense"
            label="Practice Content 2 (Optional)"
            fullWidth
            variant="outlined"
            value={formData.practiceContent2}
            onChange={(e) => handleFieldChange('practiceContent2', e.target.value)}
            sx={getFieldSx('practiceContent2')}
          />
          <TextField
            margin="dense"
            label="Practice Content 3 (Optional)"
            fullWidth
            variant="outlined"
            value={formData.practiceContent3}
            onChange={(e) => handleFieldChange('practiceContent3', e.target.value)}
            sx={getFieldSx('practiceContent3')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                color="primary"
              />
            }
            label="Active"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : (editingAffirmation ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk Update Affirmations ({selectedIds.length} selected)
        </DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={bulkData.isActive}
                onChange={(e) => setBulkData({ ...bulkData, isActive: e.target.checked })}
                color="primary"
              />
            }
            label="Set as Active"
            sx={{ mb: 2 }}
          />
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Tags (will be added to existing tags)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {bulkData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => {
                    const newTags = [...bulkData.tags];
                    newTags.splice(index, 1);
                    setBulkData({ ...bulkData, tags: newTags });
                  }}
                  deleteIcon={<Close />}
                  size="small"
                />
              ))}
            </Box>
            <Autocomplete
              value={null}
              options={availableTags.filter(tag => !bulkData.tags.includes(tag))}
              onChange={(event, newValue) => {
                if (newValue && !bulkData.tags.includes(newValue)) {
                  setBulkData({ ...bulkData, tags: [...bulkData.tags, newValue] });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Add tags..."
                  size="small"
                  fullWidth
                />
              )}
              freeSolo
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkUpdate} variant="contained" color="primary">
            Update Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Confirmation Dialog */}
      <Dialog open={showConfirmAI} onClose={() => setShowConfirmAI(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Generate AI Content
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You already have content in some fields. Generating AI content will overwrite:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            {formData.affirmationTitle && !userEditedFields.has('affirmationTitle') && (
              <Typography component="li" variant="body2" color="text.secondary">
                Affirmation Title
              </Typography>
            )}
            {formData.affirmationContent && !userEditedFields.has('affirmationContent') && (
              <Typography component="li" variant="body2" color="text.secondary">
                Affirmation Content
              </Typography>
            )}
            {formData.descriptionContent && !userEditedFields.has('descriptionContent') && (
              <Typography component="li" variant="body2" color="text.secondary">
                Description Content
              </Typography>
            )}
            {formData.practiceContent1 && !userEditedFields.has('practiceContent1') && (
              <Typography component="li" variant="body2" color="text.secondary">
                Practice Content 1
              </Typography>
            )}
            {formData.practiceContent2 && !userEditedFields.has('practiceContent2') && (
              <Typography component="li" variant="body2" color="text.secondary">
                Practice Content 2
              </Typography>
            )}
            {formData.practiceContent3 && !userEditedFields.has('practiceContent3') && (
              <Typography component="li" variant="body2" color="text.secondary">
                Practice Content 3
              </Typography>
            )}
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Do you want to continue and replace this content
          </Typography>
          <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
            Note: Fields with green borders (user-entered data) will NOT be overwritten
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmAI(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmAIGeneration} 
            variant="contained" 
            color="secondary"
            disabled={generatingAI}
            startIcon={generatingAI ? <CircularProgress size={16} /> : <AutoAwesome />}
          >
            {generatingAI ? 'Generating...' : 'Yes, Generate'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Affirmations;