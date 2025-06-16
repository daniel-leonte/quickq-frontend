import { useState, useEffect, useRef } from 'react';
import type { Job, ChatMessage, InterviewResponse, QuestionAnswer, FeedbackRequest } from '../types/job';
import { jobService } from '../services/jobService';

interface InterviewChatProps {
  job: Job;
  onBack: () => void;
}

export function InterviewChat({ job, onBack }: InterviewChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [overallFeedback, setOverallFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (overallFeedback) {
      // Small delay to ensure the feedback content is rendered before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [overallFeedback]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response: InterviewResponse = await jobService.getInterviewQuestions(job);
        setQuestions(response.questions);
        
        // Add first question to chat
        if (response.questions.length > 0) {
          const firstMessage: ChatMessage = {
            id: '1',
            content: response.questions[0],
            type: 'question'
          };
          setMessages([firstMessage]);
        }
      } catch (err) {
        setError('Failed to load interview questions. Please try again.');
        console.error('Error loading questions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [job]);

  const handleSubmitResponse = async () => {
    if (!userResponse.trim()) return;

    // Add user response to chat
    const responseMessage: ChatMessage = {
      id: `response-${currentQuestionIndex}`,
      content: userResponse,
      type: 'answer'
    };

    setMessages(prev => [...prev, responseMessage]);

    // Create question-answer pair
    const questionAnswer: QuestionAnswer = {
      question: questions[currentQuestionIndex],
      answer: userResponse.trim()
    };

    const updatedQuestionAnswers = [...questionAnswers, questionAnswer];
    setQuestionAnswers(updatedQuestionAnswers);

    setUserResponse('');
    setIsLoadingFeedback(true);
    setShowingFeedback(true);

    try {
      // Get feedback for this answer
      const feedbackRequest: FeedbackRequest = {
        job: {
          title: job.title,
          description: job.description,
          skills: job.skills
        },
        questions: [questionAnswer] // Send only current question-answer pair
      };

      const feedbackResponse = await jobService.getFeedback(feedbackRequest);
      
      // Add feedback message to chat
      const feedbackMessage: ChatMessage = {
        id: `feedback-${currentQuestionIndex}`,
        content: feedbackResponse.feedback,
        type: 'feedback'
      };

      setMessages(prev => [...prev, feedbackMessage]);
    } catch (err) {
      console.error('Error getting feedback:', err);
      // Add error message instead of feedback
      const errorMessage: ChatMessage = {
        id: `feedback-error-${currentQuestionIndex}`,
        content: 'Sorry, we could not generate feedback for this answer. Please continue to the next question.',
        type: 'feedback'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleNextQuestion = async () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    
    if (nextQuestionIndex < questions.length) {
      // Move to next question
      setShowingFeedback(false);
      setTimeout(() => {
        const nextQuestion: ChatMessage = {
          id: `question-${nextQuestionIndex}`,
          content: questions[nextQuestionIndex],
          type: 'question'
        };
        setMessages(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(nextQuestionIndex);
      }, 500);
    } else {
      // All questions completed - get overall feedback
      setIsLoadingFeedback(true);
      setShowingFeedback(false);
      
      try {
        const overallFeedbackRequest: FeedbackRequest = {
          job: {
            title: job.title,
            description: job.description,
            skills: job.skills
          },
          questions: questionAnswers // Send all question-answer pairs
        };

        const overallFeedbackResponse = await jobService.getFeedback(overallFeedbackRequest);
        setOverallFeedback(overallFeedbackResponse.feedback);
      } catch (err) {
        console.error('Error getting overall feedback:', err);
        setOverallFeedback('We encountered an issue generating your overall interview feedback. Thank you for completing the interview!');
      } finally {
        setIsLoadingFeedback(false);
        setIsComplete(true);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitResponse();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Interview Simulation</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading interview questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Interview Simulation</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold">Interview Simulation</h1>
            <p className="text-sm text-gray-600">{job.title} at {job.company}</p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-white px-4 py-2 border-b">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Question {Math.min(currentQuestionIndex + 1, questions.length)} of {questions.length}</span>
          <div className="flex space-x-1">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentQuestionIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'answer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                message.type === 'answer'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'feedback'
                  ? 'bg-yellow-50 text-gray-800 shadow-sm border border-yellow-200'
                  : 'bg-white text-gray-800 shadow-sm border-l-4 border-blue-500'
              }`}
            >
              {message.type === 'feedback' && (
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-700">Feedback</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoadingFeedback && (
          <div className="flex justify-start">
            <div className="bg-yellow-50 border border-yellow-200 shadow-sm px-4 py-2 rounded-lg max-w-xs md:max-w-md lg:max-w-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                <span className="text-sm text-gray-600">
                  {currentQuestionIndex + 1 >= questions.length && !showingFeedback 
                    ? "Generating overall interview feedback..." 
                    : "Generating feedback..."}
                </span>
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="text-center py-8">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Complete!</h3>
            
            {overallFeedback && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left max-w-4xl mx-auto">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="text-lg font-semibold text-blue-800">Overall Interview Feedback</h4>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {overallFeedback}
                </div>
              </div>
            )}

            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Jobs
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area or Next button */}
      {!isComplete && (
        <div className="bg-white border-t p-4">
          {showingFeedback && !isLoadingFeedback ? (
            <div className="flex justify-center">
              <button
                onClick={handleNextQuestion}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'Finish Interview'}
              </button>
            </div>
          ) : !showingFeedback && !isLoadingFeedback ? (
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  disabled={isLoadingFeedback}
                />
              </div>
              <button
                onClick={handleSubmitResponse}
                disabled={!userResponse.trim() || isLoadingFeedback}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 