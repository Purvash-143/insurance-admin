import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  People as PeopleIcon,
  LocalHospital as LocalHospitalIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import membersData from '../data/members.json';
import NotificationService from '../services/NotificationService';

const Dashboard = ({ analysisData }) => {
  const [memberStats, setMemberStats] = useState({});
  const [diseaseData, setDiseaseData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [notificationStats, setNotificationStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  const notificationService = new NotificationService();

  useEffect(() => {
    calculateMemberStats();
    calculateDiseaseDistribution();
    calculateStatusDistribution();
    calculateAgeDistribution();
    loadNotificationStats();
    generateRecentActivity();
  }, [analysisData]);

  const calculateMemberStats = () => {
    const members = membersData.members;
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'Active').length;
    const pendingMembers = members.filter(m => m.status === 'Pending').length;
    const totalPremium = members.reduce((sum, m) => sum + m.premiumAmount, 0);
    const avgPremium = totalPremium / totalMembers;

    setMemberStats({
      total: totalMembers,
      active: activeMembers,
      pending: pendingMembers,
      totalPremium,
      avgPremium: Math.round(avgPremium)
    });
  };

  const calculateDiseaseDistribution = () => {
    // Use analysis data if available, otherwise show coverage info
    if (analysisData && analysisData.diseaseDistribution) {
      const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
      const chartData = analysisData.diseaseDistribution.slice(0, 5).map((item, index) => ({
        name: item.disease,
        value: item.count,
        percentage: parseFloat(item.percentage),
        color: colors[index % colors.length]
      }));
      setDiseaseData(chartData);
    } else {
      // Show coverage information instead of member diseases
      const coveredDiseases = JSON.parse(localStorage.getItem('coveredDiseases')) || [];
      const coverageData = coveredDiseases.slice(0, 5).map((disease, index) => ({
        name: disease.name,
        value: membersData.members.length, // All members are covered
        percentage: 100, // 100% coverage for all diseases
        color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]
      }));
      setDiseaseData(coverageData);
    }
  };

  const calculateStatusDistribution = () => {
    const statusCount = {};
    membersData.members.forEach(member => {
      statusCount[member.status] = (statusCount[member.status] || 0) + 1;
    });

    const statusChart = Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: ((count / membersData.members.length) * 100).toFixed(1)
    }));

    setStatusData(statusChart);
  };

  const calculateAgeDistribution = () => {
    const ageGroups = {
      '20-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0,
      '60+': 0
    };

    membersData.members.forEach(member => {
      const age = member.age;
      if (age <= 30) ageGroups['20-30']++;
      else if (age <= 40) ageGroups['31-40']++;
      else if (age <= 50) ageGroups['41-50']++;
      else if (age <= 60) ageGroups['51-60']++;
      else ageGroups['60+']++;
    });

    const ageChart = Object.entries(ageGroups).map(([ageGroup, count]) => ({
      ageGroup,
      count,
      percentage: ((count / membersData.members.length) * 100).toFixed(1)
    }));

    setAgeData(ageChart);
  };

  const loadNotificationStats = () => {
    setNotificationStats(notificationService.getNotificationStats());
  };

  const generateRecentActivity = () => {
    const activities = [
      { id: 1, type: 'member_joined', description: 'New member Sarah Johnson joined', time: '2 hours ago' },
      { id: 2, type: 'notification_sent', description: '15 coverage notifications sent', time: '4 hours ago' },
      { id: 3, type: 'file_analyzed', description: 'Health data file analyzed - Hypertension most common', time: '1 day ago' },
      { id: 4, type: 'premium_payment', description: 'Premium payment received from John Smith', time: '1 day ago' },
      { id: 5, type: 'policy_updated', description: 'Policy updated for Michael Brown', time: '2 days ago' }
    ];
    setRecentActivity(activities);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'member_joined': return <PeopleIcon fontSize="small" />;
      case 'notification_sent': return <EmailIcon fontSize="small" />;
      case 'file_analyzed': return <LocalHospitalIcon fontSize="small" />;
      default: return <TrendingUpIcon fontSize="small" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'member_joined': return 'success';
      case 'notification_sent': return 'primary';
      case 'file_analyzed': return 'warning';
      default: return 'default';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Insurance Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of members, policies, and health analytics
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" gutterBottom>
                  Total Members
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {memberStats.total}
              </Typography>
              <Typography variant="body2" color="success.main">
                {memberStats.active} Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalHospitalIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="text.secondary" gutterBottom>
                  Diseases Covered
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {JSON.parse(localStorage.getItem('coveredDiseases') || '[]').length}
              </Typography>
              <Typography variant="body2" color="success.main">
                100% Coverage
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography color="text.secondary" gutterBottom>
                  Total Premium
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                ${memberStats.totalPremium?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg: ${memberStats.avgPremium}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="info" sx={{ mr: 1 }} />
                <Typography color="text.secondary" gutterBottom>
                  Notifications
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {notificationStats.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notificationStats.today || 0} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Disease Coverage Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {analysisData ? 'Disease Distribution from Analysis' : 'Disease Coverage Overview'}
            </Typography>
            {diseaseData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={diseaseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {diseaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [
                      analysisData ? `${value} members` : `${value} members covered`, 
                      name
                    ]} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <Box sx={{ mt: 2 }}>
                  {diseaseData.map((item, index) => (
                    <Chip
                      key={item.name}
                      label={`${item.name}: ${analysisData ? `${item.value} (${item.percentage}%)` : '100% Covered'}`}
                      size="small"
                      sx={{ 
                        mr: 1, 
                        mb: 1,
                        backgroundColor: COLORS[index % COLORS.length],
                        color: 'white'
                      }}
                    />
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LocalHospitalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No disease coverage data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add diseases in Disease Coverage section
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Age Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Age Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ageGroup" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Member Status Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Member Status Overview
            </Typography>
            <List>
              {statusData.map((status, index) => (
                <React.Fragment key={status.name}>
                  <ListItem>
                    <ListItemText
                      primary={status.name}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={parseFloat(status.percentage)} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                            {status.value} members ({status.percentage}%)
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < statusData.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <Box sx={{ mr: 2 }}>
                      <Chip
                        icon={getActivityIcon(activity.type)}
                        label=""
                        size="small"
                        color={getActivityColor(activity.type)}
                        sx={{ width: 40, height: 40, borderRadius: '50%' }}
                      />
                    </Box>
                    <ListItemText
                      primary={activity.description}
                      secondary={activity.time}
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
