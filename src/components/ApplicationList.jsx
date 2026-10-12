import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  ExternalLink, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText,
  Clock
} from 'lucide-react';
import StatusBadge, { STATUS_CONFIG } from './StatusBadge';

export default function ApplicationList({
  applications,
  loading,
  searchKeyword,
  setSearchKeyword,
  statusFilter,
  setStatusFilter,
  onOpenAddModal,
  onOpenEditModal,
  onSelectApplication,
  onOpenInterviewModal,
  onDeleteApplication,
  onUpdateStatus,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const statuses = ['ALL', ...Object.keys(STATUS_CONFIG)];

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleStatusChange = async (appId, newStatus, e) => {
    e.stopPropagation();
    await onUpdateStatus(appId, newStatus);
  };

  return (
    <div className="applications-view">
      {/* Top Filter and Controls Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by company or job title..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <button className="clear-btn" onClick={() => setSearchKeyword('')}>
              ×
            </button>
          )}
        </div>

        <div className="controls-right">
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="status-tabs-container">
        <span className="filter-label">
          <Filter size={14} /> Filter Status:
        </span>
        <div className="status-tabs">
          {statuses.map((status) => {
            const isAll = status === 'ALL';
            const isActive = isAll ? !statusFilter : statusFilter === status;
            return (
              <button
                key={status}
                className={`status-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setStatusFilter(isAll ? '' : status)}
              >
                {isAll ? 'All Roles' : STATUS_CONFIG[status]?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Application Content */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Fetching job applications from database...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state-card">
          <FileText size={48} color="#94A3B8" />
          <h3>No applications found</h3>
          <p>
            {searchKeyword || statusFilter
              ? 'Try modifying your search or clearing your filters.'
              : 'Start your tracking by logging your first job application.'}
          </p>
          {searchKeyword || statusFilter ? (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchKeyword('');
                setStatusFilter('');
              }}
            >
              Clear Filters
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <Plus size={16} /> Add First Application
            </button>
          )}
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map((app) => (
            <div
              key={app.id}
              className="application-card"
              onClick={() => onSelectApplication(app)}
            >
              <div className="card-top">
                <div className="company-info">
                  <h3 className="company-name">{app.companyName}</h3>
                  <h4 className="job-title">{app.jobTitle}</h4>
                </div>

                <div className="status-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
                  <select
                    className="status-select"
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value, e)}
                  >
                    {Object.keys(STATUS_CONFIG).map((st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="card-meta">
                <div className="meta-item">
                  <Clock size={14} />
                  <span>Applied: {app.applicationDate}</span>
                </div>
                {app.jobLink && (
                  <a
                    href={app.jobLink}
                    target="_blank"
                    rel="noreferrer"
                    className="meta-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                    <span>Job Post</span>
                  </a>
                )}
              </div>

              {app.notes && (
                <div className="card-notes">
                  <p>{app.notes}</p>
                </div>
              )}

              {/* Interviews snippet */}
              <div className="card-interviews-snippet">
                {app.interviews && app.interviews.length > 0 ? (
                  <div className="interview-badge-box">
                    <Calendar size={14} color="#B45309" />
                    <span>{app.interviews.length} Interview Round{app.interviews.length > 1 ? 's' : ''}</span>
                  </div>
                ) : (
                  <span className="no-interviews-text">No interviews scheduled yet</span>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onOpenInterviewModal(app)}
                  title="Schedule Interview"
                >
                  <Calendar size={14} />
                  <span>Interview</span>
                </button>

                <div className="action-buttons-group">
                  <button
                    className="icon-action-btn"
                    onClick={() => onSelectApplication(app)}
                    title="View Full Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="icon-action-btn"
                    onClick={() => onOpenEditModal(app)}
                    title="Edit Application"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="icon-action-btn delete-btn"
                    onClick={() => onDeleteApplication(app.id, app.companyName)}
                    title="Delete Application"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
