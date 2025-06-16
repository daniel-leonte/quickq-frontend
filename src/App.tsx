import { useState } from 'react';
import { JobList, InterviewChat } from './components';
import type { Job } from './types/job';

type AppView = 'jobs' | 'interview';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('jobs');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleStartInterview = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('interview');
  };

  const handleBackToJobs = () => {
    setCurrentView('jobs');
    setSelectedJob(null);
  };

  return (
    <>
      {currentView === 'jobs' && (
        <JobList onInterviewClick={handleStartInterview} />
      )}
      {currentView === 'interview' && selectedJob && (
        <InterviewChat job={selectedJob} onBack={handleBackToJobs} />
      )}
    </>
  );
}

export default App
