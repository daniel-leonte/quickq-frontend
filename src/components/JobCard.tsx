import { useState } from 'react';
import type { Job } from '../types/job';

interface JobCardProps {
  job: Job;
  onInterviewClick?: (job: Job) => void;
}

export function JobCard({ job, onInterviewClick }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const parseMarkdownToJSX = (text: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    return paragraphs.map((paragraph, pIndex) => {
      const lines = paragraph.split('\n');
      const elements: React.ReactNode[] = [];
      let currentListItems: string[] = [];
      
      const flushListItems = () => {
        if (currentListItems.length > 0) {
          elements.push(
            <ul key={`list-${pIndex}-${elements.length}`} className="list-disc list-inside space-y-1 mt-2 mb-2">
              {currentListItems.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-700">{item}</li>
              ))}
            </ul>
          );
          currentListItems = [];
        }
      };
      
      lines.forEach((line, lIndex) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        
        // Headers
        if (trimmedLine.startsWith('## ')) {
          flushListItems();
          elements.push(
            <h3 key={`${pIndex}-${lIndex}`} className="text-base font-semibold text-gray-900 mt-4 mb-2 first:mt-0">
              {trimmedLine.replace('## ', '')}
            </h3>
          );
        }
        // Bullet points
        else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          const content = trimmedLine.replace(/^[*-] /, '');
          currentListItems.push(content);
        }
        // Regular text
        else {
          flushListItems();
          elements.push(
            <p key={`${pIndex}-${lIndex}`} className="text-sm text-gray-700 leading-relaxed mb-2">
              {trimmedLine}
            </p>
          );
        }
      });
      
      flushListItems(); // Flush any remaining list items
      
      return <div key={pIndex}>{elements}</div>;
    });
  };

  const truncateDescription = (description: string, maxLength: number = 200) => {
    const plainText = description.replace(/[#*-]/g, '').replace(/\n+/g, ' ').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  const shouldShowExpandButton = job.description.length > 300;
  const descriptionContent = isExpanded 
    ? parseMarkdownToJSX(job.description)
    : truncateDescription(job.description);

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

      <div className="mb-4">
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden'}`}>
          {isExpanded ? (
            <div className="prose prose-sm max-w-none">
              {descriptionContent}
            </div>
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">
              {descriptionContent}
            </p>
          )}
        </div>
        
        {shouldShowExpandButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Show less of job description' : 'Show full job description'}
          >
            {isExpanded ? '← Show less' : 'Read more →'}
          </button>
        )}
      </div>

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