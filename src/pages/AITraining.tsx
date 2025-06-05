import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Autocomplete,
  Switch,
  useTheme,
  Fade,
} from '@mui/material';
import {
  Psychology,
  Feedback,
  Analytics,
  Article,
  Add,
  Edit,
  Delete,
  Download,
  Visibility,
  Star,
  TrendingUp,
  Close,
  Search,
  Refresh,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import {
  PromptTemplate,
  AffirmationFeedback,
  CreateTemplateRequest,
  FeedbackAnalytics,
  TemplateStatistics,
} from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-training-tabpanel-${index}`}
      aria-labelledby={`ai-training-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AITraining: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const theme = useTheme();

  // Common state
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Feedback History State
  const [feedbackList, setFeedbackList] = useState<AffirmationFeedback[]>([]);
  const [feedbackPage, setFeedbackPage] = useState(0);
  const [feedbackRowsPerPage, setFeedbackRowsPerPage] = useState(10);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackFilters, setFeedbackFilters] = useState({
    rating: '',
    isUsed: '',
    search: '',
  });
  const [selectedFeedback, setSelectedFeedback] = useState<AffirmationFeedback | null>(null);

  // Template Management State
  const [templateList, setTemplateList] = useState<PromptTemplate[]>([]);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [templateFormData, setTemplateFormData] = useState<CreateTemplateRequest>({
    name: '',
    tags: [],
    systemPrompt: '',
    userPromptTemplate: '',
    examples: [],
    version: 'v1',
  });

  // Analytics State
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [templateStats, setTemplateStats] = useState<TemplateStatistics | null>(null);

  const loadInitialData = async () => {
    try {
      const tagsResponse = await apiService.getTags({ limit: 1000 });
      
      if (Array.isArray(tagsResponse.data)) {
        setAvailableTags(tagsResponse.data.map((tag: any) => tag.name));
      }
    } catch (err: any) {
      setError('Failed to load initial data');
      console.error(err);
    }
  };

  const loadFeedback = useCallback(async () => {
    try {
      const response = await apiService.getFeedback({
        page: feedbackPage + 1,
        limit: feedbackRowsPerPage,
        rating: feedbackFilters.rating ? parseInt(feedbackFilters.rating) : undefined,
        isUsed: feedbackFilters.isUsed === '' ? undefined : feedbackFilters.isUsed === 'true',
        search: feedbackFilters.search || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      
      console.log('Feedback API response:', response); // Debug log
      
      // Handle different response structures and parse JSON strings
      let feedbackData: any[] = [];
      
      if (Array.isArray(response)) {
        feedbackData = response;
      } else if (response.data) {
        feedbackData = Array.isArray(response.data) ? response.data : [];
      }
      
      // Parse JSON strings in the response
      const parsedFeedbackData = feedbackData.map((item: any) => {
        const parsedItem = { ...item };
        
        // Parse generatedContent if it's a string
        if (typeof item.generatedContent === 'string') {
          try {
            parsedItem.generatedContent = JSON.parse(item.generatedContent);
          } catch (e) {
            console.error('Failed to parse generatedContent:', e);
            parsedItem.generatedContent = {};
          }
        }
        
        // Parse tags if it's a string
        if (typeof item.tags === 'string') {
          try {
            parsedItem.tags = JSON.parse(item.tags);
          } catch (e) {
            console.error('Failed to parse tags:', e);
            parsedItem.tags = [];
          }
        }
        
        return parsedItem;
      });
      
      setFeedbackList(parsedFeedbackData);
      setFeedbackTotal(response.total || parsedFeedbackData.length);
    } catch (err: any) {
      setError('Failed to load feedback');
      console.error(err);
    }
  }, [feedbackPage, feedbackRowsPerPage, feedbackFilters]);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await apiService.getTemplates({
        sortBy: 'avgRating',
        sortOrder: 'DESC',
      });
      
      setTemplateList(response.data || []);
    } catch (err: any) {
      setError('Failed to load templates');
      console.error(err);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const [analyticsResponse, statsResponse] = await Promise.all([
        apiService.getFeedbackAnalytics({}),
        apiService.getTemplateStatistics(),
      ]);
      
      setAnalytics(analyticsResponse);
      setTemplateStats(statsResponse);
    } catch (err: any) {
      setError('Failed to load analytics');
      console.error(err);
    }
  }, []);


  const handleCreateTemplate = async () => {
    try {
      if (editingTemplate) {
        await apiService.updateTemplate(editingTemplate.id, templateFormData);
        setSuccessMessage('Template updated successfully!');
      } else {
        await apiService.createTemplate(templateFormData);
        setSuccessMessage('Template created successfully!');
      }
      
      setTemplateDialog(false);
      setEditingTemplate(null);
      resetTemplateForm();
      loadTemplates();
    } catch (err: any) {
      setError('Failed to save template');
      console.error(err);
    }
  };

  const handleToggleTemplateStatus = async (id: number) => {
    try {
      await apiService.toggleTemplateStatus(id);
      loadTemplates();
    } catch (err: any) {
      setError('Failed to toggle template status');
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await apiService.deleteTemplate(id);
      setSuccessMessage('Template deleted successfully!');
      loadTemplates();
    } catch (err: any) {
      setError('Failed to delete template');
      console.error(err);
    }
  };

  const handleSeedDefaultTemplates = async () => {
    try {
      await apiService.seedDefaultTemplates();
      setSuccessMessage('Default templates created successfully!');
      loadTemplates();
    } catch (err: any) {
      setError('Failed to create default templates');
      console.error(err);
    }
  };

  const resetTemplateForm = () => {
    setTemplateFormData({
      name: '',
      tags: [],
      systemPrompt: '',
      userPromptTemplate: '',
      examples: [],
      version: 'v1',
    });
  };

  const openEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setTemplateFormData({
      name: template.name,
      tags: template.tags || [],
      systemPrompt: template.systemPrompt,
      userPromptTemplate: template.userPromptTemplate,
      examples: template.examples || [],
      version: template.version,
    });
    setTemplateDialog(true);
  };

  const handleExportFeedback = async () => {
    try {
      const blob = await apiService.exportFeedback({ minRating: 4 });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-data-${new Date().toISOString().split('T')[0]}.jsonl`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage('Training data exported successfully!');
    } catch (err: any) {
      setError('Failed to export training data');
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      loadFeedback();
    } else if (tabValue === 1) {
      loadTemplates();
    } else if (tabValue === 2) {
      loadAnalytics();
    }
  }, [tabValue, feedbackPage, feedbackRowsPerPage, feedbackFilters, loadFeedback, loadTemplates, loadAnalytics]);

  return (
    <Box>
      <Fade in timeout={600}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Psychology sx={{ mr: 2, color: theme.palette.primary.main, fontSize: '2rem' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              AI Training & Feedback
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Train and improve AI affirmation generation through feedback and template management
            </Typography>
          </Box>
        </Box>
      </Fade>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(event, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab
              icon={<Feedback />}
              label="Feedback History"
              iconPosition="start"
            />
            <Tab
              icon={<Article />}
              label="Templates"
              iconPosition="start"
            />
            <Tab
              icon={<Analytics />}
              label="Analytics"
              iconPosition="start"
            />
          </Tabs>
        </Box>


        {/* Feedback History Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Feedback History</Typography>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportFeedback}
            >
              Export Training Data
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Search tags"
              value={feedbackFilters.search}
              onChange={(e) => setFeedbackFilters({ ...feedbackFilters, search: e.target.value })}
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Rating</InputLabel>
              <Select
                value={feedbackFilters.rating}
                label="Rating"
                onChange={(e) => setFeedbackFilters({ ...feedbackFilters, rating: e.target.value })}
              >
                <MenuItem value="">All ratings</MenuItem>
                <MenuItem value="5">5 stars</MenuItem>
                <MenuItem value="4">4 stars</MenuItem>
                <MenuItem value="3">3 stars</MenuItem>
                <MenuItem value="2">2 stars</MenuItem>
                <MenuItem value="1">1 star</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={feedbackFilters.isUsed}
                label="Status"
                onChange={(e) => setFeedbackFilters({ ...feedbackFilters, isUsed: e.target.value })}
              >
                <MenuItem value="">All feedback</MenuItem>
                <MenuItem value="true">Used</MenuItem>
                <MenuItem value="false">Not used</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbackList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No feedback found
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbackList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Array.isArray(item.tags) ? item.tags.map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" />
                          )) : []}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Rating value={item.rating} readOnly size="small" />
                      </TableCell>
                      <TableCell>{item.admin?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.isUsed ? 'Used' : 'Not used'}
                          color={item.isUsed ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedFeedback(item)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={feedbackTotal}
            page={feedbackPage}
            onPageChange={(event, newPage) => setFeedbackPage(newPage)}
            rowsPerPage={feedbackRowsPerPage}
            onRowsPerPageChange={(event) => {
              setFeedbackRowsPerPage(parseInt(event.target.value, 10));
              setFeedbackPage(0);
            }}
          />
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Prompt Templates</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {templateList.length === 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleSeedDefaultTemplates}
                >
                  Seed Default Templates
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setTemplateDialog(true)}
              >
                Create Template
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templateList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No templates found. Create one or seed defaults.
                    </TableCell>
                  </TableRow>
                ) : (
                  templateList.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell sx={{ fontWeight: 'medium' }}>{template.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Array.isArray(template.tags) ? template.tags.map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" />
                          )) : []}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Star sx={{ color: 'orange', mr: 0.5, fontSize: '1rem' }} />
                          {typeof template.avgRating === 'number' ? template.avgRating.toFixed(1) : 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell>{template.usageCount}</TableCell>
                      <TableCell>
                        {template.usageCount > 0 
                          ? `${Math.round((template.successCount / template.usageCount) * 100)}%`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={template.isActive}
                          onChange={() => handleToggleTemplateStatus(template.id)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => openEditTemplate(template)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            AI Training Analytics
          </Typography>
          
          {analytics && templateStats ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Feedback sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {analytics.totalFeedback}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Feedback
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Star sx={{ fontSize: 40, color: 'orange', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ color: 'orange' }}>
                      {typeof analytics.averageRating === 'number' ? analytics.averageRating.toFixed(1) : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Article sx={{ fontSize: 40, color: theme.palette.secondary.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="secondary">
                      {templateStats.activeTemplates}/{templateStats.totalTemplates}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Templates
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {Math.round(templateStats.successRate || 0)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Rating Distribution
                    </Typography>
                    {analytics.ratingDistribution?.map((item) => (
                      <Box key={item.rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ minWidth: 60 }}>
                          {item.rating} stars:
                        </Typography>
                        <Box sx={{ flexGrow: 1, mx: 2, bgcolor: 'grey.200', borderRadius: 1 }}>
                          <Box
                            sx={{
                              height: 8,
                              bgcolor: 'primary.main',
                              borderRadius: 1,
                              width: `${(item.count / Math.max(...analytics.ratingDistribution.map(r => r.count))) * 100}%`,
                            }}
                          />
                        </Box>
                        <Typography>{item.count}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Performing Templates
                    </Typography>
                    {templateStats.topTemplates?.slice(0, 5).map((template) => (
                      <Box key={template.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {template.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.usageCount} uses • {template.successCount} successes
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Star sx={{ color: 'orange', mr: 0.5, fontSize: '1rem' }} />
                          <Typography variant="body2" fontWeight="medium">
                            {typeof template.avgRating === 'number' ? template.avgRating.toFixed(1) : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </TabPanel>
      </Card>

      {/* Feedback Detail Dialog */}
      <Dialog
        open={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Feedback Details
            <IconButton onClick={() => setSelectedFeedback(null)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">
                    {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Rating</Typography>
                  <Rating value={selectedFeedback.rating} readOnly />
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Array.isArray(selectedFeedback.tags) ? selectedFeedback.tags.map((tag, idx) => (
                    <Chip key={idx} label={tag} size="small" />
                  )) : []}
                </Box>
              </Box>

              {selectedFeedback.feedback && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Feedback</Typography>
                  <Typography variant="body1">{selectedFeedback.feedback}</Typography>
                </Box>
              )}

              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
                <Typography variant="h6" gutterBottom>Generated Content</Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Title</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedFeedback.generatedContent?.affirmationTitle || 'No title available'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Affirmation</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                    {selectedFeedback.generatedContent?.affirmationContent || 'No content available'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography 
                    variant="body1"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedFeedback.generatedContent?.descriptionContent || 'No description available'
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Practice Steps</Typography>
                  <Box component="ol" sx={{ pl: 2 }}>
                    <li>{selectedFeedback.generatedContent?.practiceContent1 || 'No practice step 1'}</li>
                    <li>{selectedFeedback.generatedContent?.practiceContent2 || 'No practice step 2'}</li>
                    <li>{selectedFeedback.generatedContent?.practiceContent3 || 'No practice step 3'}</li>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFeedback(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Template Create/Edit Dialog */}
      <Dialog
        open={templateDialog}
        onClose={() => {
          setTemplateDialog(false);
          setEditingTemplate(null);
          resetTemplateForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Template Name"
              value={templateFormData.name}
              onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
              placeholder="e.g., anxiety-focused, self-esteem-builder"
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Associated Tags
              </Typography>
              <Autocomplete
                multiple
                options={availableTags}
                value={templateFormData.tags || []}
                onChange={(event, newValue) => setTemplateFormData({ ...templateFormData, tags: newValue || [] })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option} label={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Add tags this template is optimized for..."
                    variant="outlined"
                  />
                )}
              />
            </Box>

            <TextField
              label="System Prompt"
              value={templateFormData.systemPrompt}
              onChange={(e) => setTemplateFormData({ ...templateFormData, systemPrompt: e.target.value })}
              placeholder="System instructions for the AI..."
              multiline
              rows={4}
              fullWidth
            />

            <Box>
              <TextField
                label="User Prompt Template"
                value={templateFormData.userPromptTemplate}
                onChange={(e) => setTemplateFormData({ ...templateFormData, userPromptTemplate: e.target.value })}
                placeholder="User prompt with {{tags}} placeholder..."
                multiline
                rows={6}
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Use {`{{tags}}`} as a placeholder for the selected tags
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Example Outputs (Optional)
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={templateFormData.examples || []}
                onChange={(event, newValue) => setTemplateFormData({ ...templateFormData, examples: newValue || [] })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option} label={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Add example affirmations..."
                    variant="outlined"
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTemplateDialog(false);
            setEditingTemplate(null);
            resetTemplateForm();
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTemplate}
            disabled={!templateFormData.name || !templateFormData.systemPrompt || !templateFormData.userPromptTemplate}
          >
            {editingTemplate ? 'Update' : 'Create'} Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AITraining;