import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocalHospital as LocalHospitalIcon,
  Security as SecurityIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const DiseaseCoverage = () => {
  const [diseases, setDiseases] = useState([]);
  const [newDisease, setNewDisease] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [editName, setEditName] = useState('');

  // Load covered diseases from localStorage on component mount
  useEffect(() => {
    const savedDiseases = JSON.parse(localStorage.getItem('coveredDiseases')) || [];
    if (savedDiseases.length === 0) {
      // Initialize with default diseases if none exist
      const defaultDiseases = [
        { id: 1, name: 'Hypertension', addedDate: new Date().toISOString() },
        { id: 2, name: 'Diabetes', addedDate: new Date().toISOString() },
        { id: 3, name: 'Heart Disease', addedDate: new Date().toISOString() },
        { id: 4, name: 'Asthma', addedDate: new Date().toISOString() },
        { id: 5, name: 'Cancer', addedDate: new Date().toISOString() },
        { id: 6, name: 'Stroke', addedDate: new Date().toISOString() },
        { id: 7, name: 'Kidney Disease', addedDate: new Date().toISOString() },
        { id: 8, name: 'Arthritis', addedDate: new Date().toISOString() },
        { id: 9, name: 'Mental Health Disorders', addedDate: new Date().toISOString() },
        { id: 10, name: 'Cholesterol', addedDate: new Date().toISOString() }
      ];
      setDiseases(defaultDiseases);
      localStorage.setItem('coveredDiseases', JSON.stringify(defaultDiseases));
    } else {
      setDiseases(savedDiseases);
    }
  }, []);

  const handleAddDisease = async () => {
    if (!newDisease.trim()) {
      return;
    }

    // Check if disease already exists
    const existingDisease = diseases.find(
      d => d.name.toLowerCase() === newDisease.trim().toLowerCase()
    );
    
    if (existingDisease) {
      setSuccessMessage('Disease already exists in coverage list');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    setLoading(true);

    try {
      const newDiseaseObj = {
        id: Date.now(),
        name: newDisease.trim(),
        addedDate: new Date().toISOString()
      };

      const updatedDiseases = [...diseases, newDiseaseObj];
      setDiseases(updatedDiseases);
      localStorage.setItem('coveredDiseases', JSON.stringify(updatedDiseases));
      
      setNewDisease('');
      setSuccessMessage(`"${newDiseaseObj.name}" has been added to disease coverage`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding disease:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDisease = (diseaseId) => {
    const updatedDiseases = diseases.filter(d => d.id !== diseaseId);
    setDiseases(updatedDiseases);
    localStorage.setItem('coveredDiseases', JSON.stringify(updatedDiseases));
    setSuccessMessage('Disease removed from coverage');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEditDisease = (disease) => {
    setEditingDisease(disease);
    setEditName(disease.name);
    setEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      return;
    }

    const updatedDiseases = diseases.map(d => 
      d.id === editingDisease.id 
        ? { ...d, name: editName.trim() }
        : d
    );
    
    setDiseases(updatedDiseases);
    localStorage.setItem('coveredDiseases', JSON.stringify(updatedDiseases));
    
    setEditDialog(false);
    setEditingDisease(null);
    setEditName('');
    setSuccessMessage('Disease coverage updated successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddDisease();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Disease Coverage Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage diseases covered under the insurance policy. All members are automatically covered for these conditions.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" gutterBottom>
                  Total Diseases Covered
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {diseases.length}
              </Typography>
              <Typography variant="body2" color="success.main">
                Comprehensive Coverage
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalHospitalIcon color="success" sx={{ mr: 1 }} />
                <Typography color="text.secondary" gutterBottom>
                  Coverage Status
                </Typography>
              </Box>
              <Typography variant="h6" component="div" color="success.main">
                Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All members protected
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AddIcon color="info" sx={{ mr: 1 }} />
                <Typography color="text.secondary" gutterBottom>
                  Recently Added
                </Typography>
              </Box>
              <Typography variant="h6" component="div">
                {diseases.length > 0 ? diseases[diseases.length - 1]?.name : 'None'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest addition
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Add New Disease */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Disease Coverage
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Disease Name"
            value={newDisease}
            onChange={(e) => setNewDisease(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter disease name (e.g., Migraine, Allergies)"
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={handleAddDisease}
            disabled={loading || !newDisease.trim()}
            startIcon={<AddIcon />}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Add diseases that should be covered under the insurance policy for all members
        </Typography>
      </Paper>

      {/* Covered Diseases List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Currently Covered Diseases ({diseases.length})
        </Typography>
        
        {diseases.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LocalHospitalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No diseases covered yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add your first disease coverage above
            </Typography>
          </Box>
        ) : (
          <List>
            {diseases.map((disease, index) => (
              <React.Fragment key={disease.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={<LocalHospitalIcon />}
                          label={disease.name}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={`Added on ${formatDate(disease.addedDate)}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEditDisease(disease)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteDisease(disease.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < diseases.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Edit Disease Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Disease Coverage</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Disease Name"
            fullWidth
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={!editName.trim()}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DiseaseCoverage;
