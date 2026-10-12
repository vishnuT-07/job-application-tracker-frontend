import React from 'react';
import { 
  Briefcase, 
  Calendar, 
  Award, 
  XCircle, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  ArrowRight,
  Plus
} from 'lucide-react';
import StatusBadge, { STATUS_CONFIG } from './StatusBadge';

export default function Dashboard({ 
  stats, 
  loading, 
  onNavigateToApplications, 
  onNavigateToInterviews, 
  onSelectApplication,
  onOpenAddModal,
  onOpenInterviewModal
}) {
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading analytics and dashboard metrics...</p>
      </div>
    );
  }

  const {
    totalApplications = 0,
    interviewsScheduled = 0,
    offers = 0,
    rejected = 0,
    statusBreakdown = {},
    upcomingInterviews = [],
    recentApplications = []
  } = stats || {};

  // Analytics calculations
  const total = totalApplications || 0;
  const interviewRate = total > 0 ? Math.round(((statusBreakdown.INTERVIEW || 0) + (statusBreakdown.OFFER || 0)) / total * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  const formatInterviewDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div>
          <h2>Application Performance & Overview</h2>
          <p>Track your job hunt progress, upcoming rounds, and hiring funnel in real time.</p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-secondary" onClick={onOpenInterviewModal}>
            <Calendar size={15} />
            Schedule Interview
          </button>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={15} />
            Track New Job
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="stat-cards-grid">
        <div className="stat-card stat-card-total" onClick={onNavigateToApplications}>
          <div className="stat-icon-wrapper blue">
            <Briefcase size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Applications</span>
            <div className="stat-value">{totalApplications}</div>
          </div>
        </div>

        <div className="stat-card stat-card-interview" onClick={onNavigateToInterviews}>
          <div className="stat-icon-wrapper amber">
            <Calendar size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Upcoming Interviews</span>
            <div className="stat-value">{interviewsScheduled}</div>
          </div>
        </div>

        <div className="stat-card stat-card-offer">
          <div className="stat-icon-wrapper green">
            <Award size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Offers Received</span>
            <div className="stat-value">{offers}</div>
          </div>
        </div>

        <div className="stat-card stat-card-rejected">
          <div className="stat-icon-wrapper red">
            <XCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Rejections</span>
            <div className="stat-value">{rejected}</div>
          </div>
        </div>
      </div>

      {/* Analytics & Funnel Section */}
      <div className="analytics-section">
        {/* Status Distribution Visual Progress Bars */}
        <div className="analytics-card">
          <div className="analytics-header">
            <div>
              <h3>Status Distribution & Pipeline</h3>
              <p className="card-subtext">Breakdown of applications across lifecycle stages</p>
            </div>
            <span className="pipeline-total">{total} Applications</span>
          </div>

          <div className="pipeline-bars">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const count = statusBreakdown[key] || 0;
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={key} className="pipeline-item">
                  <div className="pipeline-meta">
                    <span className="pipeline-label">
                      <span className="pipeline-dot" style={{ backgroundColor: config.color }}></span>
                      {config.label}
                    </span>
                    <span className="pipeline-counts">
                      <strong>{count}</strong> ({percentage}%)
                    </span>
                  </div>
                  <div className="pipeline-track">
                    <div
                      className="pipeline-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: config.color
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Metrics */}
          <div className="analytics-metrics-footer">
            <div className="metric-pill">
              <TrendingUp size={15} color="#059669" />
              <span>Interview Conversion: <strong>{interviewRate}%</strong></span>
            </div>
            <div className="metric-pill">
              <Award size={15} color="#15803D" />
              <span>Offer Success Rate: <strong>{offerRate}%</strong></span>
            </div>
          </div>
        </div>

        {/* Upcoming Interviews Widget */}
        <div className="analytics-card">
          <div className="analytics-header">
            <div>
              <h3>Upcoming Interviews</h3>
              <p className="card-subtext">Next scheduled technical & behavioral rounds</p>
            </div>
            <button className="link-button" onClick={onNavigateToInterviews}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="empty-widget-state">
              <Calendar size={36} color="#94A3B8" />
              <p>No upcoming interviews scheduled</p>
              <button className="btn btn-secondary btn-sm" onClick={onOpenInterviewModal}>
                <Plus size={14} /> Schedule Now
              </button>
            </div>
          ) : (
            <div className="upcoming-interview-list">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="upcoming-interview-card">
                  <div className="interview-time-box">
                    <Clock size={16} />
                    <span>{formatInterviewDate(interview.interviewDate)}</span>
                  </div>
                  <div className="interview-body">
                    <h4>{interview.companyName}</h4>
                    <span className="interview-role">{interview.jobTitle}</span>
                    <div className="interview-meta-row">
                      <span className="round-tag">{interview.round}</span>
                      <span className="type-tag">{interview.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="recent-applications-card">
        <div className="analytics-header">
          <div>
            <h3>Recent Job Applications</h3>
            <p className="card-subtext">Latest roles added to your tracker</p>
          </div>
          <button className="link-button" onClick={onNavigateToApplications}>
            View All ({totalApplications}) <ArrowRight size={14} />
          </button>
        </div>

        {recentApplications.length === 0 ? (
          <div className="empty-widget-state">
            <Briefcase size={36} color="#94A3B8" />
            <p>No applications logged yet.</p>
            <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
              <Plus size={14} /> Add First Application
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job Title</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Interviews</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.companyName}</strong>
                    </td>
                    <td>{app.jobTitle}</td>
                    <td>{app.applicationDate}</td>
                    <td>
                      <StatusBadge status={app.status} size="small" />
                    </td>
                    <td>
                      {app.interviews && app.interviews.length > 0 ? (
                        <span className="interview-count-badge">
                          {app.interviews.length} round{app.interviews.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-text btn-sm"
                        onClick={() => onSelectApplication(app)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
