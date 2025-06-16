import type { Job } from '../types/job';

interface JobCardProps {
  job: Job;
  onInterviewClick?: (job: Job) => void;
}

export function JobCard({ job, onInterviewClick }: JobCardProps) {
  const getJobTypeColor = (jobType: string) => {
    switch (jobType.toLowerCase()) {
      case 'remote':
        return 'bg-green-100 text-green-800';
      case 'hybrid':
        return 'bg-blue-100 text-blue-800';
      case 'onsite':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'senior':
        return 'bg-orange-100 text-orange-800';
      case 'mid senior':
        return 'bg-yellow-100 text-yellow-800';
      case 'junior':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateDescription = (description: string, maxLength: number = 200) => {
    const plainText = description.replace(/[#*-]/g, '').replace(/\n+/g, ' ').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {job.title}
          </h3>
          <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
            {formatDate(job.first_seen)}
          </span>
        </div>
        <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
        <p className="text-gray-600 mb-3">{job.location}</p>
      </div>

      <div className="flex gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.job_type)}`}>
          {job.job_type}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(job.job_level)}`}>
          {job.job_level}
        </span>
      </div>

      <p className="text-gray-700 text-sm mb-4 leading-relaxed">
        {truncateDescription(job.description)}
      </p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 6).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 6 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              +{job.skills.length - 6} more
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        {onInterviewClick && (
          <button
            onClick={() => onInterviewClick(job)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
          >
            Start Interview Simulation
          </button>
        )}
      </div>
    </div>
  );
} 