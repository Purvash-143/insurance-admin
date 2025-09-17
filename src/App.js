import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import DiseaseCoverage from './components/DiseaseCoverage';
import FileUploadAnalysis from './components/FileUploadAnalysis';
import NotificationCenter from './components/NotificationCenter';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleSendNotification = (members) => {
    setSelectedMembers(members);
    setCurrentPage('notifications');
  };

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    // Switch to dashboard to show results
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard analysisData={analysisData} />;
      case 'members':
        return <MembersList onSendNotification={handleSendNotification} />;
      case 'disease-coverage':
        return <DiseaseCoverage />;
      case 'upload':
        return <FileUploadAnalysis onAnalysisComplete={handleAnalysisComplete} />;
      case 'notifications':
        return (
          <Box sx={{ p: 3 }}>
            <NotificationCenter 
              selectedMembers={selectedMembers} 
              onClose={() => setSelectedMembers([])}
            />
          </Box>
        );
      default:
        return <Dashboard analysisData={analysisData} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
