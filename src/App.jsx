import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ApplicationList from './components/ApplicationList';
import InterviewList from './components/InterviewList';
import ApplicationModal from './components/ApplicationModal';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import InterviewModal from './components/InterviewModal';
import { api } from './services/api';
import { CheckCircle, AlertTriangle, X, RefreshCw, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBackendLive, setIsBackendLive] = useState(null);

  // Search & Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appToEdit, setAppToEdit] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [targetAppForInterview, setTargetAppForInterview] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch applications with current search/filter
  const fetchApplications = useCallback(async () => {
    try {
      const data = await api.getApplications({
        keyword: searchKeyword,
        status: statusFilter,
      });
      setApplications(data || []);
      setIsBackendLive(api.getBackendStatus());
    } catch (err) {
      console.error('Error fetching applications:', err);
      setIsBackendLive(false);
    }
  }, [searchKeyword, statusFilter]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const stats = await api.getDashboardStats();
      setDashboardStats(stats);
      setIsBackendLive(api.getBackendStatus());
    } catch (err) {
      console.error('Error fetching stats:', err);
      setIsBackendLive(false);
    }
  }, []);

  // Fetch interviews
  const fetchInterviews = useCallback(async () => {
    try {
      const list = await api.getInterviews(false);
      setInterviews(list || []);
      setIsBackendLive(api.getBackendStatus());
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setIsBackendLive(false);
    }
  }, []);

  // Initial load & when filters change
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchApplications(), fetchDashboardStats(), fetchInterviews()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchApplications, fetchDashboardStats, fetchInterviews]);

  // Refresh single application details if selected
  const refreshSelectedApp = async (appId) => {
    try {
      const updated = await api.getApplicationById(appId);
      setSelectedApp(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for Application operations
  const handleSaveApplication = async (formData, id) => {
    if (id) {
      const updated = await api.updateApplication(id, formData);
      showToast(`Updated application for ${updated.companyName}`);
    } else {
      const created = await api.createApplication(formData);
      showToast(`Added new application for ${created.companyName}!`);
    }
    await Promise.all([fetchApplications(), fetchDashboardStats(), fetchInterviews()]);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const updated = await api.updateApplicationStatus(appId, newStatus);
      showToast(`Status changed to ${newStatus}`);
      await Promise.all([fetchApplications(), fetchDashboardStats()]);
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(updated);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteApplication = async (appId, companyName) => {
    if (window.confirm(`Are you sure you want to delete the application for "${companyName}"? This will also remove any scheduled interviews.`)) {
      try {
        await api.deleteApplication(appId);
        showToast(`Application for ${companyName} deleted`);
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp(null);
        }
        await Promise.all([fetchApplications(), fetchDashboardStats(), fetchInterviews()]);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Handlers for Interview operations
  const handleScheduleInterview = async (applicationId, payload) => {
    const scheduled = await api.scheduleInterview(applicationId, payload);
    showToast(`Scheduled "${scheduled.round}" for ${scheduled.companyName}!`);
    await Promise.all([fetchApplications(), fetchDashboardStats(), fetchInterviews()]);
    if (selectedApp && selectedApp.id === applicationId) {
      await refreshSelectedApp(applicationId);
    }
  };

  const handleDeleteInterview = async (interviewId, roundName) => {
    if (window.confirm(`Are you sure you want to cancel the interview round "${roundName}"?`)) {
      try {
        await api.deleteInterview(interviewId);
        showToast(`Interview round deleted`);
        await Promise.all([fetchApplications(), fetchDashboardStats(), fetchInterviews()]);
        if (selectedApp) {
          await refreshSelectedApp(selectedApp.id);
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleSelectApplicationById = async (appId) => {
    try {
      const app = await api.getApplicationById(appId);
      setSelectedApp(app);
    } catch (err) {
      showToast('Could not load application details', 'error');
    }
  };

  const handleCheckConnection = async () => {
    setLoading(true);
    await Promise.all([fetchApplications(), fetchDashboardStats(), fetchInterviews()]);
    setLoading(false);
    if (api.getBackendStatus()) {
      showToast('Successfully connected to Spring Boot backend!', 'success');
    } else {
      showToast('Spring Boot backend is not running yet on port 8080.', 'error');
    }
  };

  return (
    <div className="app-root">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setAppToEdit(null);
          setIsAppModalOpen(true);
        }}
        applicationCount={applications.length}
        interviewCount={interviews.length}
        isBackendLive={isBackendLive}
      />

      {/* Backend connection warning banner */}
      {isBackendLive === false && (
        <div className="connection-banner warning">
          <div className="banner-content">
            <AlertTriangle size={20} color="#d97706" />
            <div>
              <strong>Backend Offline:</strong> Spring Boot server not detected on port 8080.
              Running in <strong>Interactive Demo Mode</strong> with sample data.
              To connect to PostgreSQL live, run in backend terminal: <span className="banner-code">cd backend; mvn spring-boot:run</span>
            </div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={handleCheckConnection}>
            <RefreshCw size={14} />
            <span>Check Connection</span>
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={dashboardStats}
            loading={loading}
            onNavigateToApplications={() => setActiveTab('applications')}
            onNavigateToInterviews={() => setActiveTab('interviews')}
            onSelectApplication={(app) => setSelectedApp(app)}
            onOpenAddModal={() => {
              setAppToEdit(null);
              setIsAppModalOpen(true);
            }}
            onOpenInterviewModal={() => {
              setTargetAppForInterview(null);
              setIsInterviewModalOpen(true);
            }}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationList
            applications={applications}
            loading={loading}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onOpenAddModal={() => {
              setAppToEdit(null);
              setIsAppModalOpen(true);
            }}
            onOpenEditModal={(app) => {
              setAppToEdit(app);
              setIsAppModalOpen(true);
            }}
            onSelectApplication={(app) => setSelectedApp(app)}
            onOpenInterviewModal={(app) => {
              setTargetAppForInterview(app);
              setIsInterviewModalOpen(true);
            }}
            onDeleteApplication={handleDeleteApplication}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'interviews' && (
          <InterviewList
            interviews={interviews}
            loading={loading}
            onOpenInterviewModal={() => {
              setTargetAppForInterview(null);
              setIsInterviewModalOpen(true);
            }}
            onDeleteInterview={handleDeleteInterview}
            onSelectApplicationById={handleSelectApplicationById}
          />
        )}
      </main>

      {/* Modals */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSave={handleSaveApplication}
        applicationToEdit={appToEdit}
      />

      <ApplicationDetailsModal
        isOpen={!!selectedApp}
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onOpenEditModal={(app) => {
          setAppToEdit(app);
          setIsAppModalOpen(true);
        }}
        onOpenInterviewModal={(app) => {
          setTargetAppForInterview(app);
          setIsInterviewModalOpen(true);
        }}
        onDeleteInterview={handleDeleteInterview}
        onUpdateStatus={handleUpdateStatus}
      />

      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSave={handleScheduleInterview}
        applications={applications}
        targetApplication={targetAppForInterview}
      />
    </div>
  );
}
