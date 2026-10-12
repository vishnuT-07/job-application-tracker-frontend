import React, { useState, useEffect } from 'react';
import { X, Briefcase, Calendar, Globe, AlertCircle, Save } from 'lucide-react';
import { STATUS_CONFIG } from './StatusBadge';

export default function ApplicationModal({ isOpen, onClose, onSave, applicationToEdit }) {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    applicationDate: new Date().toISOString().split('T')[0],
    jobLink: '',
    status: 'APPLIED',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (applicationToEdit) {
      setFormData({
        companyName: applicationToEdit.companyName || '',
        jobTitle: applicationToEdit.jobTitle || '',
        applicationDate: applicationToEdit.applicationDate || new Date().toISOString().split('T')[0],
        jobLink: applicationToEdit.jobLink || '',
        status: applicationToEdit.status || 'APPLIED',
        notes: applicationToEdit.notes || '',
      });
    } else {
      setFormData({
        companyName: '',
        jobTitle: '',
        applicationDate: new Date().toISOString().split('T')[0],
        jobLink: '',
        status: 'APPLIED',
        notes: '',
      });
    }
    setErrors({});
    setServerError('');
  }, [applicationToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.companyName.trim()) {
      errs.companyName = 'Company name is required';
    }
    if (!formData.jobTitle.trim()) {
      errs.jobTitle = 'Job title is required';
    }
    if (!formData.applicationDate) {
      errs.applicationDate = 'Application date is required';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      await onSave(formData, applicationToEdit?.id);
      onClose();
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setServerError(err.message || 'Failed to save application');
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
            <Briefcase size={20} className="modal-header-icon" />
            <h3>{applicationToEdit ? 'Edit Job Application' : 'Add New Job Application'}</h3>
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
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="companyName">
                Company Name <span className="required">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="e.g. Google, Microsoft, Startup Inc."
                value={formData.companyName}
                onChange={handleChange}
                className={errors.companyName ? 'input-error' : ''}
                autoFocus
              />
              {errors.companyName && <span className="error-text">{errors.companyName}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="jobTitle">
                Job Title <span className="required">*</span>
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="e.g. Full Stack Developer, SDE 1"
                value={formData.jobTitle}
                onChange={handleChange}
                className={errors.jobTitle ? 'input-error' : ''}
              />
              {errors.jobTitle && <span className="error-text">{errors.jobTitle}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="applicationDate">
                Application Date <span className="required">*</span>
              </label>
              <div className="input-icon-wrapper">
                <Calendar size={16} className="input-icon" />
                <input
                  id="applicationDate"
                  name="applicationDate"
                  type="date"
                  value={formData.applicationDate}
                  onChange={handleChange}
                  className={errors.applicationDate ? 'input-error' : ''}
                />
              </div>
              {errors.applicationDate && <span className="error-text">{errors.applicationDate}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="status">Application Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                {Object.keys(STATUS_CONFIG).map((key) => (
                  <option key={key} value={key}>
                    {STATUS_CONFIG[key].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="jobLink">Job Posting URL (Optional)</label>
            <div className="input-icon-wrapper">
              <Globe size={16} className="input-icon" />
              <input
                id="jobLink"
                name="jobLink"
                type="url"
                placeholder="https://linkedin.com/jobs/view/... or company careers page"
                value={formData.jobLink}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes / Referral Details / Salary Expectations</label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="e.g. Referred by John on LinkedIn. Focus on Spring Boot & MySQL questions. Target CTC: 12 LPA."
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{applicationToEdit ? 'Update Application' : 'Save Application'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
