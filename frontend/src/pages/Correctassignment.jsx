// src/pages/CorrectAssignment.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI, correctionAPI } from '../services/api';

export default function CorrectAssignment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    comments: '',
    grade: '',
    suggestions: '',
  });

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    try {
      const data = await assignmentAPI.getById(id);
      setAssignment(data);

      // Si déjà en cours de correction, charger les données
      if (data.status === 'IN_PROGRESS') {
        // Charger la correction en cours si elle existe
        const corrections = await correctionAPI.getAll();
        const existing = corrections.find(c => c.assignment.id === data.id);
        if (existing) {
          setFormData({
            comments: existing.comments || '',
            grade: existing.grade || '',
            suggestions: existing.suggestions || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleStartCorrection = async () => {
    try {
      await assignmentAPI.update(id, { status: 'IN_PROGRESS' });
      setAssignment({ ...assignment, status: 'IN_PROGRESS' });
    } catch (error) {
      console.error('Error starting correction:', error);
      setError('Failed to start correction');
    }
  };

  const handleSaveDraft = async () => {
    setError('');
    try {
      // Sauvegarder comme brouillon
      const correctionData = {
        assignment: id,
        tutor: user.id,
        comments: formData.comments,
        grade: formData.grade ? parseFloat(formData.grade) : null,
        suggestions: formData.suggestions,
        status: 'DRAFT',
      };

      await correctionAPI.create(correctionData);
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Failed to save draft');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.comments.trim()) {
      setError('Please provide comments');
      return;
    }

    if (!formData.grade || formData.grade === '') {
      setError('Please provide a grade');
      return;
    }

    const grade = parseFloat(formData.grade);
    if (isNaN(grade) || grade < 0 || grade > 20) {
      setError('Grade must be between 0 and 20');
      return;
    }

    setSubmitting(true);

    try {
      const correctionData = {
        assignment: id,
        tutor: user.id,
        comments: formData.comments,
        grade: grade,
        suggestions: formData.suggestions || '',
        status: 'COMPLETED',
      };

      await correctionAPI.create(correctionData);

      // Mettre à jour le statut de l'assignment
      await assignmentAPI.update(id, { status: 'CORRECTED' });

      // Rediriger vers le dashboard
      navigate('/tutor/dashboard', {
        state: { message: 'Correction submitted successfully!' },
      });
    } catch (error) {
      console.error('Error submitting correction:', error);
      setError(error.response?.data?.message || 'Failed to submit correction');
      setSubmitting(false);
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
    if (!grade) return 'No grade';
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
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assignment not found</h2>
          <button
            onClick={() => navigate('/tutor/dashboard')}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
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
              onClick={() => navigate('/tutor/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-semibold transition"
            >
              <span className="text-xl">←</span>
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <h1 className="text-xl font-black text-gray-800">
                Course<span className="font-light text-green-600">Correct</span>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-gray-800">Assignment</h2>
                {isPremium && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border-2 border-purple-200">
                    ⭐ Premium
                  </span>
                )}
              </div>

              {/* Course Info */}
              <div className="mb-6">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl mb-3">
                  📚
                </div>
                <h3 className="font-black text-lg text-gray-800 mb-1">
                  {assignment.course.subject.code}
                </h3>
                <p className="text-gray-600 text-sm">
                  {assignment.course.subject.name}
                </p>
              </div>

              {/* Student Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Student
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {assignment.student.first_name[0]}{assignment.student.last_name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {assignment.student.first_name} {assignment.student.last_name}
                    </p>
                    <p className="text-sm text-gray-500">@{assignment.student.username}</p>
                  </div>
                </div>
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
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    assignment.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status === 'IN_PROGRESS' ? '✍️ In Progress' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Payment</span>
                  <span className="font-bold text-green-600">
                    {isPremium ? '$15.00' : 'Free'}
                  </span>
                </div>
              </div>

              {/* File Download */}
              <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition flex items-center justify-center gap-2">
                <span className="text-xl">📥</span>
                Download File
              </button>

              {/* Start Correction Button */}
              {assignment.status === 'PENDING' && (
                <button
                  onClick={handleStartCorrection}
                  className="w-full mt-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition shadow-lg"
                >
                  🚀 Start Correction
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Correction Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="text-5xl">✍️</div>
                <div>
                  <h2 className="text-3xl font-black text-gray-800">Correction</h2>
                  <p className="text-gray-600">Provide detailed feedback and grade</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
                  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grade Input */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Grade (0-20) *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      step="0.5"
                      placeholder="15.5"
                      className="w-32 px-6 py-4 text-4xl font-black text-center border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                    <div>
                      <div className={`text-3xl font-black ${getGradeColor(formData.grade)}`}>
                        / 20
                      </div>
                      <div className={`text-sm font-semibold mt-1 ${getGradeColor(formData.grade)}`}>
                        {getGradeLabel(formData.grade)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label htmlFor="comments" className="block text-sm font-bold text-gray-800 mb-3">
                    Comments *
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    required
                    rows={8}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none font-medium text-gray-800"
                    placeholder="Provide detailed feedback on the student's work. What did they do well? What needs improvement?"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.comments.length} characters
                  </p>
                </div>

                {/* Suggestions */}
                <div>
                  <label htmlFor="suggestions" className="block text-sm font-bold text-gray-800 mb-3">
                    Suggestions for Improvement
                  </label>
                  <textarea
                    id="suggestions"
                    name="suggestions"
                    value={formData.suggestions}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none font-medium text-gray-800"
                    placeholder="Optional: Provide specific suggestions on how the student can improve their work in the future."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition"
                  >
                    💾 Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-black transition shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>✅</span>
                        Submit Correction
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500 italic">
                  * Required fields
                </p>
              </form>
            </div>

            {/* Tips Card */}
            <div className="mt-6 bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💡</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Correction Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Start with positive feedback on what the student did well</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Be specific about errors and how to fix them</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Provide constructive suggestions for improvement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Keep a professional and encouraging tone</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}