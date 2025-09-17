import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Analytics as AnalyticsIcon,
  FilePresent as FilePresentIcon,
  Sms as SmsIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import NotificationService from '../services/NotificationService';
import membersData from '../data/members.json';

const FileUploadAnalysis = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [smsResult, setSmsResult] = useState(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

  const notificationService = new NotificationService();

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const fileType = selectedFile.name.split('.').pop().toLowerCase();
      if (!['csv', 'json'].includes(fileType)) {
        setError('Please select a CSV or JSON file');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setAnalysisResult(null);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV file must have headers and data');
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];
    
    // Find relevant columns
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const diseaseIndex = headers.findIndex(h => h.includes('disease') || h.includes('condition') || h.includes('illness'));
    const emailIndex = headers.findIndex(h => h.includes('email'));
    
    if (diseaseIndex === -1) {
      throw new Error('CSV file must contain a column with "disease", "condition", or "illness" in the header');
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= headers.length) {
        data.push({
          name: nameIndex >= 0 ? values[nameIndex] : `Member ${i}`,
          disease: values[diseaseIndex],
          email: emailIndex >= 0 ? values[emailIndex] : `member${i}@email.com`,
          id: i
        });
      }
    }
    
    return data;
  };

  const parseJSON = (jsonText) => {
    const jsonData = JSON.parse(jsonText);
    let data = [];
    
    // Handle different JSON structures
    if (Array.isArray(jsonData)) {
      data = jsonData;
    } else if (jsonData.members && Array.isArray(jsonData.members)) {
      data = jsonData.members;
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      data = jsonData.data;
    } else {
      throw new Error('JSON file must contain an array of member data or have a "members" or "data" property');
    }

    // Validate and normalize data structure
    return data.map((item, index) => ({
      id: item.id || index + 1,
      name: item.name || item.memberName || `Member ${index + 1}`,
      disease: item.disease || item.diseases || item.condition || item.medicalCondition || 'Unknown',
      email: item.email || item.emailAddress || `member${index + 1}@email.com`
    }));
  };

  const analyzeDiseases = (memberData) => {
    const diseaseCount = {};
    const totalMembers = memberData.length;
    
    memberData.forEach(member => {
      let diseases = [];
      
      // Handle different disease formats
      if (typeof member.disease === 'string') {
        if (member.disease.includes(',')) {
          diseases = member.disease.split(',').map(d => d.trim());
        } else if (member.disease.includes(';')) {
          diseases = member.disease.split(';').map(d => d.trim());
        } else {
          diseases = [member.disease.trim()];
        }
      } else if (Array.isArray(member.disease)) {
        diseases = member.disease;
      } else {
        diseases = ['Unknown'];
      }
      
      diseases.forEach(disease => {
        if (disease && disease.toLowerCase() !== 'none' && disease.toLowerCase() !== 'unknown') {
          diseaseCount[disease] = (diseaseCount[disease] || 0) + 1;
        }
      });
    });

    // Sort diseases by frequency
    const sortedDiseases = Object.entries(diseaseCount)
      .map(([disease, count]) => ({
        disease,
        count,
        percentage: ((count / totalMembers) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalMembers,
      uniqueDiseases: sortedDiseases.length,
      mostCommonDisease: sortedDiseases[0] || null,
      diseaseDistribution: sortedDiseases,
      memberData
    };
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fileText = await file.text();
      let memberData;

      if (file.name.endsWith('.csv')) {
        memberData = parseCSV(fileText);
      } else if (file.name.endsWith('.json')) {
        memberData = parseJSON(fileText);
      } else {
        throw new Error('Unsupported file format');
      }

      const analysis = analyzeDiseases(memberData);
      setAnalysisResult(analysis);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis);
      }

      // Show SMS dialog after successful analysis if there's a significant disease pattern
      if (analysis.mostCommonDisease && analysis.mostCommonDisease.percentage >= 20) {
        setShowSMSDialog(true);
      }
    } catch (err) {
      setError(err.message || 'Error analyzing file');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDiseaseAlertSMS = async () => {
    setSendingSMS(true);
    try {
      const members = membersData.members; // Send to all insurance members
      const result = await notificationService.sendDiseaseAlertSMS(members, analysisResult);
      
      if (result.success) {
        setSmsResult(result);
        setShowSuccessSnackbar(true);
        setShowSMSDialog(false);
      } else {
        setError(result.error || 'Failed to send SMS notifications');
      }
    } catch (err) {
      setError(err.message || 'Error sending SMS notifications');
    } finally {
      setSendingSMS(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `Name,Email,Disease,Age
John Doe,john@email.com,Hypertension,35
Jane Smith,jane@email.com,Diabetes,28
Bob Johnson,bob@email.com,Asthma,42
Alice Brown,alice@email.com,Hypertension,31
Mike Wilson,mike@email.com,Cholesterol,39`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-health-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Health Data Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload a CSV or JSON file containing member health data to identify the most common diseases
      </Typography>

      {/* File Upload Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <input
            accept=".csv,.json"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              size="large"
              sx={{ mb: 2 }}
            >
              Select File
            </Button>
          </label>
          
          {file && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Chip
                icon={<FilePresentIcon />}
                label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={!file || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
            size="large"
            sx={{ ml: 2 }}
          >
            {loading ? 'Analyzing...' : 'Analyze Data'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button variant="text" size="small" onClick={downloadSampleCSV}>
            Download Sample CSV File
          </Button>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Results
          </Typography>
          
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Members
                  </Typography>
                  <Typography variant="h4">
                    {analysisResult.totalMembers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Unique Diseases
                  </Typography>
                  <Typography variant="h4">
                    {analysisResult.uniqueDiseases}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Most Common Disease
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {analysisResult.mostCommonDisease?.disease || 'None'}
                  </Typography>
                  {analysisResult.mostCommonDisease && (
                    <Typography variant="body2" color="text.secondary">
                      {analysisResult.mostCommonDisease.count} members ({analysisResult.mostCommonDisease.percentage}%)
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Disease Distribution */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Disease Distribution
            </Typography>
            <List>
              {analysisResult.diseaseDistribution.slice(0, 10).map((item, index) => (
                <React.Fragment key={item.disease}>
                  <ListItem>
                    <ListItemText
                      primary={item.disease}
                      secondary={`${item.count} members (${item.percentage}%)`}
                    />
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      color={index === 0 ? 'primary' : 'default'}
                    />
                  </ListItem>
                  {index < Math.min(analysisResult.diseaseDistribution.length - 1, 9) && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Paper>
      )}

      {/* SMS Alert Dialog */}
      <Dialog 
        open={showSMSDialog} 
        onClose={() => setShowSMSDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmsIcon color="primary" />
            Disease Alert Notification
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Analysis shows that <strong>{analysisResult?.mostCommonDisease?.disease}</strong> affects{' '}
            <strong>{analysisResult?.mostCommonDisease?.percentage}%</strong> of members in the uploaded data.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Would you like to send an SMS health alert to all {membersData.members.length} insurance members 
            about this health trend?
          </Typography>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>SMS Preview:</strong><br />
              "Good News! We cover {analysisResult?.mostCommonDisease?.disease} treatment. Recent analysis shows{' '}
              {analysisResult?.mostCommonDisease?.percentage}% prevalence. Don't panic - your insurance policy provides{' '}
              full coverage for {analysisResult?.mostCommonDisease?.disease}. Schedule a preventive checkup today. - Insurance Admin"
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSMSDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendDiseaseAlertSMS}
            disabled={sendingSMS}
            startIcon={sendingSMS ? <CircularProgress size={20} /> : <SmsIcon />}
          >
            {sendingSMS ? 'Sending...' : `Send SMS to ${membersData.members.length} Members`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
          icon={<CheckCircleIcon />}
        >
          <Typography variant="h6" gutterBottom>
            SMS Notifications Sent Successfully!
          </Typography>
          <Typography variant="body2">
            {smsResult?.totalSent} SMS messages sent to insurance members about {smsResult?.diseaseInfo?.disease} health alert.
            {smsResult?.totalFailed > 0 && ` ${smsResult.totalFailed} failed to send.`}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileUploadAnalysis;
