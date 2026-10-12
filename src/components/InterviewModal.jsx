import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, AlertCircle, Save } from 'lucide-react';

export default function InterviewModal({
  isOpen,
  onClose,
  onSave,
  applications = [],
  targetApplication = null,
}) {
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // default 2 days in future
    d.setHours(10, 0, 0, 0); // 10:00 AM
    // format as YYYY-MM-DDTHH:mm
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    jobApplicationId: '',
    interviewDate: getDefaultDateTime(),
    round: '',
    type: 'Online Video (Google Meet / Zoom)',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const ROUND_SUGGESTIONS = [
    'HR Screening',
    'Technical Round 1',
    'Technical Round 2',
    'System Design',
    'Managerial / Behavioral',
    'Final Culture Fit'
  ];

  const TYPE_OPTIONS = [
    'Online Video (Google Meet / Zoom)',
    'On-site / In-person',
    'Phone Screen',
    'Take-home Project Review'
  ];

  useEffect(() => {
    if (targetApplication) {
      setFormData((prev) => ({
        ...prev,
        jobApplicationId: targetApplication.id,
        interviewDate: getDefaultDateTime(),
        round: '',
        type: 'Online Video (Google Meet / Zoom)',
        notes: '',
      }));
    } else if (applications.length > 0) {
      setFormData((prev) => ({
        ...prev,
        jobApplicationId: applications[0].id,
        interviewDate: getDefaultDateTime(),
        round: '',
        type: 'Online Video (Google Meet / Zoom)',
        notes: '',
      }));
    }
    setErrors({});
    setServerError('');
  }, [targetApplication, applications, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.jobApplicationId) {
      errs.jobApplicationId = 'Please select a job application';
    }
    if (!formData.interviewDate) {
      errs.interviewDate = 'Interview date and time is required';
    }
    if (!formData.round.trim()) {
      errs.round = 'Round name is required';
    }
    if (!formData.type.trim()) {
      errs.type = 'Interview type is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectRoundSuggestion = (suggestion) => {
    setFormData((prev) => ({ ...prev, round: suggestion }));
    if (errors.round) {
      setErrors((prev) => ({ ...prev, round: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      await onSave(formData.jobApplicationId, {
        interviewDate: formData.interviewDate,
        round: formData.round.trim(),
        type: formData.type.trim(),
        notes: formData.notes.trim(),
      });
      onClose();
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setServerError(err.message || 'Failed to schedule interview');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Calendar size={20} className="modal-header-icon" />
            <h3>Schedule Interview Round</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={submitting}>
            <X size={18} />
          </button>
        </div>

        {serverError && (
          <div className="modal-alert-error">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Target Application selection */}
          <div className="form-group">
            <label htmlFor="jobApplicationId">
              Associated Job Application <span className="required">*</span>
            </label>
            {targetApplication ? (
              <div className="readonly-app-display">
                <strong>{targetApplication.companyName}</strong> — {targetApplication.jobTitle}
              </div>
            ) : (
              <select
                id="jobApplicationId"
                name="jobApplicationId"
                value={formData.jobApplicationId}
                onChange={handleChange}
                className={errors.jobApplicationId ? 'input-error' : ''}
              >
                <option value="">Select a company application...</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.companyName} ({app.jobTitle})
                  </option>
                ))}
              </select>
            )}
            {errors.jobApplicationId && <span className="error-text">{errors.jobApplicationId}</span>}
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="interviewDate">
                Interview Date & Time <span className="required">*</span>
              </label>
              <div className="input-icon-wrapper">
                <Clock size={16} className="input-icon" />
                <input
                  id="interviewDate"
                  name="interviewDate"
                  type="datetime-local"
                  value={formData.interviewDate}
                  onChange={handleChange}
                  className={errors.interviewDate ? 'input-error' : ''}
                />
              </div>
              {errors.interviewDate && <span className="error-text">{errors.interviewDate}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="type">
                Interview Format / Type <span className="required">*</span>
              </label>
              <select id="type" name="type" value={formData.type} onChange={handleChange}>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="round">
              Round Name <span className="required">*</span>
            </label>
            <input
              id="round"
              name="round"
              type="text"
              placeholder="e.g. Technical Round 1: Java & Problem Solving"
              value={formData.round}
              onChange={handleChange}
              className={errors.round ? 'input-error' : ''}
            />
            {errors.round && <span className="error-text">{errors.round}</span>}

            {/* Quick Suggestions Chips */}
            <div className="suggestion-chips">
              <span className="chips-label">Suggestions:</span>
              {ROUND_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  className="chip-btn"
                  onClick={() => handleSelectRoundSuggestion(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Preparation Notes / Meeting Link</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="e.g. Google Meet link: meet.google.com/xyz. Prepare explanations on Spring Boot Dependency Injection and JPA entity relationships."
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Confirm Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
