import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, coursesData] = await Promise.all([
          authService.getCurrentUser(),
          authService.getCourses(),
        ]);
        setUser(userData);
        setCourses(coursesData);
      } catch (err) {
        console.error('Erreur lors du chargement des données', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authService.isAuthenticated()) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Course Correct</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Bienvenue, {user?.first_name || user?.username}!
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Mes Cours</h2>

        {courses.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">Aucun cours disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-2">{course.subject?.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {course.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Début: {course.start_date}</span>
                  <span>Fin: {course.end_date}</span>
                </div>
                <span className={`mt-4 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  course.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
