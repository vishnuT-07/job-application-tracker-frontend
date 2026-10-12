import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Trash2, 
  Plus, 
  Search, 
  ExternalLink, 
  Briefcase,
  AlertCircle
} from 'lucide-react';

export default function InterviewList({
  interviews = [],
  loading,
  onOpenInterviewModal,
  onDeleteInterview,
  onSelectApplicationById,
}) {
  const [filterUpcoming, setFilterUpcoming] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const now = new Date();

  const filteredInterviews = interviews.filter((item) => {
    const itemDate = new Date(item.interviewDate);
    const matchesFilter = !filterUpcoming || itemDate >= now;
    const matchesSearch =
      !searchTerm ||
      (item.companyName && item.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.jobTitle && item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.round && item.round.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

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

  const isPast = (dateStr) => {
    return new Date(dateStr) < now;
  };

  return (
    <div className="interviews-view">
      {/* Top Controls */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by company or round name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="controls-right">
          <div className="filter-pill-toggle">
            <button
              className={`toggle-btn ${!filterUpcoming ? 'active' : ''}`}
              onClick={() => setFilterUpcoming(false)}
            >
              All Rounds ({interviews.length})
            </button>
            <button
              className={`toggle-btn ${filterUpcoming ? 'active' : ''}`}
              onClick={() => setFilterUpcoming(true)}
            >
              Upcoming
            </button>
          </div>

          <button className="btn btn-primary" onClick={onOpenInterviewModal}>
            <Plus size={16} />
            <span>Schedule Interview</span>
          </button>
        </div>
      </div>

      {/* Interviews List */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Fetching scheduled interviews...</p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="empty-state-card">
          <Calendar size={48} color="#94A3B8" />
          <h3>No interviews found</h3>
          <p>
            {searchTerm || filterUpcoming
              ? 'Try adjusting your search criteria or switching to All Rounds.'
              : 'Keep track of upcoming technical, behavioral, and HR interviews here.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenInterviewModal}>
            <Plus size={16} /> Schedule First Interview
          </button>
        </div>
      ) : (
        <div className="interviews-grid">
          {filteredInterviews.map((item) => {
            const past = isPast(item.interviewDate);
            return (
              <div key={item.id} className={`interview-card ${past ? 'past-interview' : ''}`}>
                <div className="interview-card-header">
                  <div className="company-info">
                    <h3 className="company-name">{item.companyName}</h3>
                    <h4 className="job-title">{item.jobTitle}</h4>
                  </div>
                  <span className={`status-tag ${past ? 'tag-past' : 'tag-upcoming'}`}>
                    {past ? 'Completed' : 'Upcoming'}
                  </span>
                </div>

                <div className="interview-card-body">
                  <div className="detail-row">
                    <Clock size={16} className="detail-icon" />
                    <strong>{formatInterviewDate(item.interviewDate)}</strong>
                  </div>

                  <div className="detail-row">
                    <Calendar size={16} className="detail-icon" />
                    <span>Round: <strong>{item.round}</strong></span>
                  </div>

                  <div className="detail-row">
                    <Video size={16} className="detail-icon" />
                    <span>Format: <strong>{item.type}</strong></span>
                  </div>

                  {item.notes && (
                    <div className="interview-card-notes">
                      <p>{item.notes}</p>
                    </div>
                  )}
                </div>

                <div className="interview-card-footer">
                  {item.jobApplicationId && (
                    <button
                      className="btn btn-text btn-sm"
                      onClick={() => onSelectApplicationById(item.jobApplicationId)}
                    >
                      <Briefcase size={14} /> View Application
                    </button>
                  )}

                  <button
                    className="icon-action-btn delete-btn"
                    onClick={() => onDeleteInterview(item.id, item.round)}
                    title="Cancel Interview"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
