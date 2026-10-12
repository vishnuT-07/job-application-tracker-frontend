import React from 'react';
import { Briefcase, LayoutDashboard, Calendar, Plus } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, applicationCount = 0, interviewCount = 0 }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">
            <Briefcase size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <h1>JobTracker</h1>
            <span className="brand-subtitle">Interview & Analytics</span>
          </div>
        </div>

        <nav className="navbar-nav">
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <Briefcase size={17} />
            <span>Applications</span>
            {applicationCount > 0 && <span className="nav-badge">{applicationCount}</span>}
          </button>

          <button
            className={`nav-link ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            <Calendar size={17} />
            <span>Interviews</span>
            {interviewCount > 0 && <span className="nav-badge">{interviewCount}</span>}
          </button>
        </nav>

        <div className="navbar-actions">
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>Add Application</span>
          </button>
        </div>
      </div>
    </header>
  );
}
