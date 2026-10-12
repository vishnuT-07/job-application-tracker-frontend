/**
 * Sample realistic data used when the Spring Boot backend is offline
 * to ensure the UI remains fully interactive and testable during reviews/demos.
 */

export const INITIAL_MOCK_APPLICATIONS = [
  {
    id: 1,
    companyName: 'Google',
    jobTitle: 'Associate Software Engineer',
    applicationDate: '2026-10-02',
    jobLink: 'https://careers.google.com/jobs/results/12345',
    status: 'INTERVIEW',
    notes: 'Referred by senior alumnus. Strong focus on Graph Algorithms and Spring Boot fundamentals.',
    createdAt: '2026-10-02T10:00:00',
    updatedAt: '2026-10-10T14:30:00',
    interviews: [
      {
        id: 101,
        jobApplicationId: 1,
        companyName: 'Google',
        jobTitle: 'Associate Software Engineer',
        interviewDate: '2026-10-16T15:00:00',
        round: 'Technical Round 1: DSA & Problem Solving',
        type: 'Online Video (Google Meet / Zoom)',
        notes: 'Prepare dynamic programming and graph traversals. Meet link sent over email.',
        createdAt: '2026-10-05T12:00:00'
      }
    ]
  },
  {
    id: 2,
    companyName: 'Microsoft',
    jobTitle: 'Software Development Engineer - I',
    applicationDate: '2026-09-28',
    jobLink: 'https://careers.microsoft.com/us/en/job/67890',
    status: 'OFFER',
    notes: 'Campus placement drive. 4 rounds completed. Offer letter received with 14.5 LPA CTC!',
    createdAt: '2026-09-28T09:30:00',
    updatedAt: '2026-10-08T16:00:00',
    interviews: [
      {
        id: 102,
        jobApplicationId: 2,
        companyName: 'Microsoft',
        jobTitle: 'Software Development Engineer - I',
        interviewDate: '2026-10-04T10:00:00',
        round: 'System Design & Core Java',
        type: 'Online Video (Google Meet / Zoom)',
        notes: 'Discussed Microservices and database indexing.',
        createdAt: '2026-10-01T11:00:00'
      }
    ]
  },
  {
    id: 3,
    companyName: 'Amazon',
    jobTitle: 'Software Development Engineer (AWS)',
    applicationDate: '2026-10-05',
    jobLink: 'https://amazon.jobs/en/jobs/246810',
    status: 'ASSESSMENT',
    notes: 'Completed online assessment (OA) on HackerRank. Solved 2/2 coding questions. Waiting for round 1 invite.',
    createdAt: '2026-10-05T11:20:00',
    updatedAt: '2026-10-06T18:00:00',
    interviews: []
  },
  {
    id: 4,
    companyName: 'Stripe',
    jobTitle: 'Full Stack Engineer - Integrations',
    applicationDate: '2026-10-08',
    jobLink: 'https://stripe.com/jobs/search/13579',
    status: 'APPLIED',
    notes: 'Submitted resume and portfolio showcasing React and Spring Boot full stack project.',
    createdAt: '2026-10-08T14:15:00',
    updatedAt: '2026-10-08T14:15:00',
    interviews: []
  },
  {
    id: 5,
    companyName: 'Uber',
    jobTitle: 'Backend Engineer - Rider Platform',
    applicationDate: '2026-09-15',
    jobLink: 'https://uber.com/careers/998877',
    status: 'REJECTED',
    notes: 'Cleared screening but missed cutoff in high-concurrency low-level design round. Good learning experience.',
    createdAt: '2026-09-15T08:00:00',
    updatedAt: '2026-09-25T17:00:00',
    interviews: []
  }
];

export function computeMockStats(applications) {
  const total = applications.length;
  const now = new Date();

  let upcomingCount = 0;
  const upcomingInterviews = [];

  applications.forEach(app => {
    (app.interviews || []).forEach(iv => {
      if (new Date(iv.interviewDate) >= now) {
        upcomingCount++;
        upcomingInterviews.push(iv);
      }
    });
  });

  const offers = applications.filter(a => a.status === 'OFFER').length;
  const rejected = applications.filter(a => a.status === 'REJECTED').length;

  const statusBreakdown = {
    APPLIED: 0,
    ASSESSMENT: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  applications.forEach(a => {
    if (statusBreakdown[a.status] !== undefined) {
      statusBreakdown[a.status]++;
    }
  });

  return {
    totalApplications: total,
    interviewsScheduled: upcomingCount,
    offers,
    rejected,
    statusBreakdown,
    upcomingInterviews: upcomingInterviews.slice(0, 5),
    recentApplications: applications.slice(0, 5)
  };
}
