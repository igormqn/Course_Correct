// src/pages/AssignmentDetail.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI, correctionAPI } from '../services/api';

export default function AssignmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [correction, setCorrection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const assignmentData = await assignmentAPI.getById(id);
      setAssignment(assignmentData);

      // Charger la correction si elle existe
      if (assignmentData.status === 'CORRECTED') {
        const corrections = await correctionAPI.getAll();
        const assignmentCorrection = corrections.find(
          (c) => c.assignment.id === assignmentData.id
        );
        if (assignmentCorrection) {
          setCorrection(assignmentCorrection);
        }
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      setError('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CORRECTED':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'IN_PROGRESS':
        return '✍️';
      case 'CORRECTED':
        return '✅';
      default:
        return '📄';
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-400';
    if (grade >= 16) return 'text-green-600';
    if (grade >= 12) return 'text-blue-600';
    if (grade >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLabel = (grade) => {
    if (!grade) return 'Not graded yet';
    if (grade >= 16) return 'Excellent';
    if (grade >= 14) return 'Very Good';
    if (grade >= 12) return 'Good';
    if (grade >= 10) return 'Pass';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assignment not found</h2>
          <p className="text-gray-600 mb-6">{error || 'This assignment does not exist'}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPremium = assignment.service?.is_premium;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition"
            >
              <span className="text-xl">←</span>
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <h1 className="text-xl font-black text-gray-800">
                Course<span className="font-light text-blue-600">Correct</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Assignment Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Assignment Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-800">Assignment</h2>
                {isPremium && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border-2 border-purple-200">
                    ⭐ Premium
                  </span>
                )}
              </div>

              {/* Course Info */}
              <div className="mb-6">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mb-3">
                  📚
                </div>
                <h3 className="font-black text-lg text-gray-800 mb-1">
                  {assignment.course.subject.code}
                </h3>
                <p className="text-gray-600 text-sm">{assignment.course.subject.name}</p>
              </div>

              {/* Status */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(
                    assignment.status
                  )}`}
                >
                  <span>{getStatusIcon(assignment.status)}</span>
                  {assignment.status === 'PENDING'
                    ? 'Pending Correction'
                    : assignment.status === 'IN_PROGRESS'
                    ? 'Being Corrected'
                    : 'Corrected'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-bold text-gray-800">{assignment.service.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Submitted</span>
                  <span className="font-bold text-gray-800">
                    {new Date(assignment.submitted_at).toLocaleDateString('en-US')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price Paid</span>
                  <span className="font-bold text-green-600">
                    {isPremium ? '$29.99' : 'Free'}
                  </span>
                </div>
              </div>

              {/* File Download */}
              <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2">
                <span className="text-xl">📥</span>
                Download My File
              </button>
            </div>
          </div>

          {/* Right Column - Correction Details */}
          <div className="lg:col-span-2 space-y-6">
            {assignment.status === 'CORRECTED' && correction ? (
              <>
                {/* Grade Card */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl shadow-2xl p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-green-100 text-sm font-semibold mb-2">Your Grade</p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-6xl font-black">{correction.grade}</span>
                        <span className="text-4xl font-bold opacity-75">/ 20</span>
                      </div>
                      <p className={`text-2xl font-bold mt-2 ${getGradeColor(correction.grade)}`}>
                        {getGradeLabel(correction.grade)}
                      </p>
                    </div>
                    <div className="text-7xl">🎓</div>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-sm text-green-50">
                      <span className="font-bold">Corrected on:</span>{' '}
                      {new Date(correction.corrected_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Tutor Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                  <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    <span>👨‍🏫</span>
                    Your Tutor
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {correction.tutor.first_name[0]}
                      {correction.tutor.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        {correction.tutor.first_name} {correction.tutor.last_name}
                      </p>
                      <p className="text-gray-600 text-sm">@{correction.tutor.username}</p>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                  <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    <span>💬</span>
                    Feedback & Comments
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {correction.comments}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                {correction.suggestions && (
                  <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
                    <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                      <span>💡</span>
                      Suggestions for Improvement
                    </h3>
                    <div className="bg-white rounded-xl p-6 border-2 border-blue-100">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {correction.suggestions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/student/dashboard')}
                    className="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition"
                  >
                    Back to Dashboard
                  </button>
                  <button className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg">
                    Download Correction Report
                  </button>
                </div>
              </>
            ) : (
              /* Waiting for Correction */
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-6 animate-pulse">⏳</div>
                <h3 className="text-2xl font-black text-gray-800 mb-3">
                  {assignment.status === 'IN_PROGRESS'
                    ? 'Correction in Progress'
                    : 'Waiting for Correction'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {assignment.status === 'IN_PROGRESS'
                    ? 'Your tutor is currently reviewing your assignment. You will be notified once the correction is complete!'
                    : 'Your assignment has been submitted and is waiting to be assigned to a tutor. You will receive a notification once correction begins.'}
                </p>
                <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto border-2 border-blue-100">
                  <p className="text-sm text-blue-800 font-semibold mb-2">
                    ⏱️ Expected delivery:
                  </p>
                  <p className="text-2xl font-black text-blue-600">
                    {isPremium ? 'Within 48 hours' : 'Within 7 days'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}