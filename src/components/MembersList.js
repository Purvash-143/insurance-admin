import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Toolbar,
  Tooltip,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import membersData from '../data/members.json';

const MembersList = ({ onSendNotification }) => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    setMembers(membersData.members);
    setFilteredMembers(membersData.members);
  }, []);

  useEffect(() => {
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSendNotification = (member) => {
    if (onSendNotification) {
      onSendNotification([member]);
    }
  };

  const handleBulkNotification = () => {
    if (onSendNotification && selectedMembers.length > 0) {
      const membersToNotify = members.filter(member => 
        selectedMembers.includes(member.id)
      );
      onSendNotification(membersToNotify);
      setSelectedMembers([]);
    }
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Insurance Members ({filteredMembers.length})
          </Typography>
          
          {selectedMembers.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EmailIcon />}
              onClick={handleBulkNotification}
              sx={{ mr: 2 }}
            >
              Send Notification ({selectedMembers.length})
            </Button>
          )}

          <TextField
            size="small"
            placeholder="Search members..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        </Toolbar>

        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  {/* Checkbox header */}
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Policy Number</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Premium</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow
                  hover
                  key={member.id}
                  selected={selectedMembers.includes(member.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => toggleMemberSelection(member.id)}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Box>
                      <Typography variant="subtitle2">{member.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.occupation}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{member.policyNumber}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    <Chip 
                      label={member.status} 
                      color={getStatusColor(member.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${member.premiumAmount}</TableCell>
                  <TableCell>{formatDate(member.joinDate)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Send Notification">
                      <IconButton 
                        size="small" 
                        onClick={() => handleSendNotification(member)}
                        color="primary"
                      >
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MembersList;
