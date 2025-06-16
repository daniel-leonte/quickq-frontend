import { useState, useEffect, useMemo } from 'react';
import type { Job } from '../types/job';
import { JobCard } from './JobCard';
import { jobService, type JobSearchParams } from '../services/jobService';

export function JobList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalJobs, setTotalJobs] = useState(0);

  // Load initial jobs on component mount
  useEffect(() => {
    const loadInitialJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await jobService.searchJobs({
          query: 'software engineer', // Default search term
          limit: 5,
        });
        setJobs(response.jobs);
        setTotalJobs(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialJobs();
  }, []);

  // Search jobs when search term changes (with debouncing)
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        const searchParams: JobSearchParams = {
          query: searchTerm.trim(),
          limit: 5,
        };

        // Add level filter if selected
        if (levelFilter !== 'all') {
          searchParams.job_level = levelFilter;
        }

        const response = await jobService.searchJobs(searchParams);
        setJobs(response.jobs);
        setTotalJobs(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search jobs');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, levelFilter]);

  // Filter jobs locally by job type (since API doesn't support this filter)
  const filteredJobs = useMemo(() => {
    if (jobTypeFilter === 'all') {
      return jobs;
    }
    return jobs.filter(job => job.job_type.toLowerCase() === jobTypeFilter.toLowerCase());
  }, [jobs, jobTypeFilter]);

  const handleInterviewClick = (job: Job) => {
    console.log('Starting interview simulation for:', job.title, 'at', job.company);
    // TODO: Implement interview simulation navigation
    alert(`Interview simulation for ${job.title} at ${job.company} would start here!`);
  };

  // Get unique job types and levels from current jobs for filter options
  const uniqueJobTypes = [...new Set(jobs.map(job => job.job_type))];
  const uniqueLevels = ['Entry level', 'Mid level', 'Senior', 'Lead', 'Principal', 'Director'];

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const searchParams: JobSearchParams = {
        query: searchTerm.trim(),
        limit: 5,
      };

      if (levelFilter !== 'all') {
        searchParams.job_level = levelFilter;
      }

      const response = await jobService.searchJobs(searchParams);
      setJobs(response.jobs);
      setTotalJobs(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tech Jobs
          </h1>
          <p className="text-gray-600">
            Browse available tech positions and start interview simulations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Jobs
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="search"
                    placeholder="e.g. software engineer, data scientist, product manager..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={loading || !searchTerm.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Job Type Filter */}
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  id="jobType"
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {uniqueJobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  id="level"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  {uniqueLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading jobs</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredJobs.length} of {totalJobs} jobs
              {searchTerm && (
                <span className="ml-2 text-blue-600">
                  for "{searchTerm}"
                </span>
              )}
            </p>
          </div>
        )}

        {/* Job Grid */}
        {!loading && !error && (
          <>
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs.map((job, index) => (
                  <JobCard 
                    key={`${job.company}-${job.title}-${index}`}
                    job={job} 
                    onInterviewClick={handleInterviewClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">
                  {searchTerm ? (
                    <>Try searching for different keywords or adjusting your filters.</>
                  ) : (
                    <>Enter a search term to find jobs.</>
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 