import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import NotificationService, { EMAIL_TEMPLATES, SMS_TEMPLATES } from '../services/NotificationService';

const NotificationCenter = ({ selectedMembers = [], onClose }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationType, setNotificationType] = useState('email');
  const [selectedTemplate, setSelectedTemplate] = useState('coverage_notification');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [customSMSMessage, setCustomSMSMessage] = useState('');
  const [sendResults, setSendResults] = useState(null);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [notificationStats, setNotificationStats] = useState({});
  const [tabValue, setTabValue] = useState(0);
  
  const notificationService = new NotificationService();

  useEffect(() => {
    loadNotificationData();
  }, []);

  useEffect(() => {
    if (selectedMembers.length > 0) {
      setOpen(true);
    }
  }, [selectedMembers]);

  const loadNotificationData = () => {
    setNotificationHistory(notificationService.getNotificationHistory());
    setNotificationStats(notificationService.getNotificationStats());
  };

  const handleTemplateChange = (event) => {
    const templateKey = event.target.value;
    setSelectedTemplate(templateKey);
    
    if (templateKey === 'custom') {
      if (notificationType === 'email') {
        setCustomSubject('');
        setCustomContent('');
      } else {
        setCustomSMSMessage('');
      }
    } else {
      if (notificationType === 'email') {
        const template = EMAIL_TEMPLATES[templateKey];
        setCustomSubject(template.subject);
        setCustomContent(template.content);
      } else {
        const template = SMS_TEMPLATES[templateKey];
        setCustomSMSMessage(template.message);
      }
    }
  };

  const handleNotificationTypeChange = (event) => {
    const type = event.target.value;
    setNotificationType(type);
    
    // Reset template when switching types
    setSelectedTemplate('coverage_notification');
    if (type === 'email') {
      const template = EMAIL_TEMPLATES['coverage_notification'];
      setCustomSubject(template.subject);
      setCustomContent(template.content);
      setCustomSMSMessage('');
    } else {
      const template = SMS_TEMPLATES['coverage_notification'];
      setCustomSMSMessage(template.message);
      setCustomSubject('');
      setCustomContent('');
    }
  };

  const handleSendNotifications = async () => {
    if (selectedMembers.length === 0) {
      return;
    }

    setLoading(true);
    setSendResults(null);

    try {
      let results;
      
      if (notificationType === 'email') {
        const template = {
          subject: customSubject || EMAIL_TEMPLATES[selectedTemplate].subject,
          content: customContent || EMAIL_TEMPLATES[selectedTemplate].content
        };
        results = await notificationService.sendBulkNotifications(selectedMembers, template);
      } else {
        const message = customSMSMessage || SMS_TEMPLATES[selectedTemplate].message;
        results = await notificationService.sendBulkSMS(selectedMembers, message);
      }
      
      setSendResults(results);
      loadNotificationData(); // Refresh data
      
      // Auto close after success
      setTimeout(() => {
        if (onClose) onClose();
        handleClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error sending notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSendResults(null);
    setNotificationType('email');
    setSelectedTemplate('coverage_notification');
    setCustomSubject('');
    setCustomContent('');
    setCustomSMSMessage('');
    if (onClose) onClose();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const clearHistory = () => {
    notificationService.clearHistory();
    loadNotificationData();
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<EmailIcon />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Notification Center
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon />
            Notification Center
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Send Notifications" />
            <Tab label="History & Stats" />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              {/* Statistics Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom variant="caption">
                        Total Sent
                      </Typography>
                      <Typography variant="h6">
                        {notificationStats.total || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom variant="caption">
                        Today
                      </Typography>
                      <Typography variant="h6">
                        {notificationStats.today || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom variant="caption">
                        Successful
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {notificationStats.successful || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom variant="caption">
                        Emails Sent
                      </Typography>
                      <Typography variant="h6">
                        {notificationStats.emails || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom variant="caption">
                        SMS Sent
                      </Typography>
                      <Typography variant="h6">
                        {notificationStats.sms || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {selectedMembers.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Ready to send {notificationType === 'email' ? 'email' : 'SMS'} notifications to {selectedMembers.length} member(s)
                </Alert>
              )}

              {/* Notification Type Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Notification Type</InputLabel>
                <Select
                  value={notificationType}
                  onChange={handleNotificationTypeChange}
                  label="Notification Type"
                >
                  <MenuItem value="email">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" />
                      Email
                    </Box>
                  </MenuItem>
                  <MenuItem value="sms">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmsIcon fontSize="small" />
                      SMS
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Template Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{notificationType === 'email' ? 'Email' : 'SMS'} Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                  label={`${notificationType === 'email' ? 'Email' : 'SMS'} Template`}
                >
                  <MenuItem value="coverage_notification">Coverage Notification</MenuItem>
                  <MenuItem value="welcome">Welcome Message</MenuItem>
                  <MenuItem value="health_reminder">Health Reminder</MenuItem>
                  <MenuItem value="custom">Custom Message</MenuItem>
                </Select>
              </FormControl>

              {/* Subject and Content - Email Mode */}
              {notificationType === 'email' && (
                <>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Message Content"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    sx={{ mb: 2 }}
                    helperText="Use {{name}}, {{policyNumber}}, {{email}} for personalization"
                  />
                </>
              )}

              {/* SMS Message - SMS Mode */}
              {notificationType === 'sms' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="SMS Message"
                  value={customSMSMessage}
                  onChange={(e) => setCustomSMSMessage(e.target.value)}
                  sx={{ mb: 2 }}
                  helperText="Use {{name}}, {{policyNumber}} for personalization. Keep under 160 characters for single SMS."
                  inputProps={{ maxLength: 320 }}
                />
              )}

              {/* Selected Members Preview */}
              {selectedMembers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recipients ({selectedMembers.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedMembers.slice(0, 5).map(member => (
                      <Chip
                        key={member.id}
                        label={member.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {selectedMembers.length > 5 && (
                      <Chip
                        label={`+${selectedMembers.length - 5} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}

              {/* Send Results */}
              {sendResults && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 2 }}
                  icon={<CheckCircleIcon />}
                >
                  Successfully sent {sendResults.filter(r => r.success).length} {notificationType === 'email' ? 'email' : 'SMS'} notifications!
                  {sendResults.filter(r => !r.success).length > 0 && (
                    <Typography variant="body2">
                      {sendResults.filter(r => !r.success).length} failed to send.
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Notification History</Typography>
                <Button variant="outlined" size="small" onClick={clearHistory}>
                  Clear History
                </Button>
              </Box>

              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {notificationHistory.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No notifications sent yet"
                      secondary="Send your first notification to see history here"
                    />
                  </ListItem>
                ) : (
                  notificationHistory.map((notification) => (
                    <React.Fragment key={notification.id}>
                      <ListItem>
                        <ListItemText
                          primary={notification.subject || notification.message}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                To: {notification.to}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(notification.timestamp)} • {notification.type.toUpperCase()}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {notification.type === 'sms' && (
                              <Chip
                                icon={<SmsIcon />}
                                label="SMS"
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            )}
                            {notification.type === 'email' && (
                              <Chip
                                icon={<EmailIcon />}
                                label="Email"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            <Chip
                              icon={notification.status === 'sent' ? <CheckCircleIcon /> : <ErrorIcon />}
                              label={notification.status}
                              color={notification.status === 'sent' ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                )}
              </List>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          {tabValue === 0 && (
            <Button
              variant="contained"
              onClick={handleSendNotifications}
              disabled={loading || selectedMembers.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : (notificationType === 'email' ? <EmailIcon /> : <SmsIcon />)}
            >
              {loading ? 'Sending...' : `Send ${notificationType === 'email' ? 'Email' : 'SMS'} to ${selectedMembers.length} member(s)`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationCenter;
