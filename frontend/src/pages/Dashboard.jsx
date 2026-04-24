import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    graded: 0,
    average: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignmentsData = await authService.getAssignments();
        setAssignments(assignmentsData);

        // Calculate stats
        const graded = assignmentsData.filter(a => a.status === 'graded').length;
        const grades = assignmentsData
          .filter(a => a.grade)
          .map(a => a.grade);
        const average = grades.length > 0
          ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1)
          : 0;

        setStats({
          total: assignmentsData.length,
          graded,
          average,
        });
      } catch (err) {
        console.error('Erreur lors du chargement des données', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⟳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <h1 className="text-xl font-bold text-white">
                Course<span className="font-normal">Correct</span>
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-white">
                <p className="text-sm">Cours</p>
                <p className="text-xs opacity-75">Mon Espace</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
                  👤
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">{user?.first_name || 'Utilisateur'} S.</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-white hover:text-blue-200 text-sm font-semibold transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-blue-100">
                Étudiant · {user?.university || 'Université'}
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-blue-100 mt-1">Soumissions</div>
            </div>
            <div className="bg-blue-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.graded}</div>
              <div className="text-sm text-blue-100 mt-1">Corrigées</div>
            </div>
            <div className="bg-blue-700 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{stats.average}/20</div>
              <div className="text-sm text-blue-100 mt-1">Moyenne</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Historique des Soumissions
          </h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition">
            + Soumettre un travail
          </button>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {assignments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 text-lg">
                Aucune soumission pour le moment
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Cours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Soumis le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{assignment.course?.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {assignment.course?.code}
                          </p>
                          <p className="text-xs text-gray-600">
                            {assignment.course?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(assignment.submitted_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-gray-600">
                        {assignment.service_type === 'premium' ? '⭐ Premium' : '📝 Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {assignment.grade ? `${assignment.grade}/20` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          assignment.status === 'graded'
                            ? 'bg-green-100 text-green-800'
                            : assignment.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {assignment.status === 'graded'
                          ? '✓ Corrigée'
                          : assignment.status === 'in_progress'
                          ? '⟳ En cours'
                          : '↑ Soumise'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition">
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
