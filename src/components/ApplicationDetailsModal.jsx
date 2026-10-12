import React from 'react';
import { 
  X, 
  Briefcase, 
  Calendar, 
  Globe, 
  FileText, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink 
} from 'lucide-react';
import StatusBadge, { STATUS_CONFIG } from './StatusBadge';

export default function ApplicationDetailsModal({
  isOpen,
  application,
  onClose,
  onOpenEditModal,
  onOpenInterviewModal,
  onDeleteInterview,
  onUpdateStatus,
}) {
  if (!isOpen || !application) return null;

  const formatInterviewDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="company-logo-avatar">
              {application.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{application.companyName}</h3>
              <p className="modal-subtitle">{application.jobTitle}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Details Content */}
        <div className="modal-details-body">
          {/* Status & Action Strip */}
          <div className="details-status-strip">
            <div className="status-meta">
              <span className="meta-label">Current Status:</span>
              <StatusBadge status={application.status} />
              <select
                className="status-select-inline"
                value={application.status}
                onChange={(e) => onUpdateStatus(application.id, e.target.value)}
              >
                {Object.keys(STATUS_CONFIG).map((st) => (
                  <option key={st} value={st}>
                    Change to {STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="strip-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  onOpenEditModal(application);
                }}
              >
                <Edit3 size={14} /> Edit Application
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="details-info-grid">
            <div className="info-box">
              <span className="info-box-label">
                <Clock size={14} /> Applied On
              </span>
              <span className="info-box-val">{application.applicationDate}</span>
            </div>

            <div className="info-box">
              <span className="info-box-label">
                <Globe size={14} /> Job Posting
              </span>
              {application.jobLink ? (
                <a
                  href={application.jobLink}
                  target="_blank"
                  rel="noreferrer"
                  className="info-box-val link"
                >
                  Visit Job Link <ExternalLink size={12} />
                </a>
              ) : (
                <span className="info-box-val text-muted">No link provided</span>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="details-section">
            <h4 className="section-title">
              <FileText size={16} /> Notes & Context
            </h4>
            <div className="notes-box">
              {application.notes ? (
                <p>{application.notes}</p>
              ) : (
                <p className="text-muted">No notes recorded for this application.</p>
              )}
            </div>
          </div>

          {/* Scheduled Interviews Section */}
          <div className="details-section">
            <div className="section-header-flex">
              <h4 className="section-title">
                <Calendar size={16} /> Interview Rounds (
                {application.interviews ? application.interviews.length : 0})
              </h4>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onOpenInterviewModal(application);
                }}
              >
                <Plus size={14} /> Schedule Interview
              </button>
            </div>

            {(!application.interviews || application.interviews.length === 0) ? (
              <div className="empty-sub-card">
                <Calendar size={32} color="#94A3B8" />
                <p>No interviews scheduled yet for this role.</p>
              </div>
            ) : (
              <div className="interviews-timeline">
                {application.interviews.map((interview, index) => (
                  <div key={interview.id} className="timeline-item">
                    <div className="timeline-marker">{index + 1}</div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div>
                          <h5 className="round-name">{interview.round}</h5>
                          <div className="timeline-meta">
                            <span className="meta-pill">{interview.type}</span>
                            <span className="meta-time">
                              <Clock size={13} /> {formatInterviewDate(interview.interviewDate)}
                            </span>
                          </div>
                        </div>
                        <button
                          className="icon-action-btn delete-btn"
                          onClick={() => onDeleteInterview(interview.id, interview.round)}
                          title="Cancel/Delete Interview"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {interview.notes && (
                        <div className="interview-notes-box">
                          <p>{interview.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
