import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' // Fixed to admin only
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    // Check if admin exists when component mounts
    const checkAdminExists = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/admin-exists');
        const data = await response.json();
        setAdminExists(data.exists);
        
        // If admin already exists, redirect to login
        if (data.exists) {
          setError('Admin user already exists. Please use the login page.');
        }
      } catch (err) {
        console.error('Failed to check admin status:', err);
      }
    };

    checkAdminExists();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if admin already exists
    if (adminExists) {
      setError('Admin user already exists. Please use the login page.');
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      
      // Redirect to dashboard after successful registration
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-green-600 py-6 px-6">
          <div className="flex justify-center items-center">
            <UserPlus className="h-10 w-10 text-white" />
            <h2 className="ml-2 text-2xl font-bold text-white">Smoothie Admin</h2>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-2">Create Admin Account</h2>
          <p className="text-center text-gray-500 mb-6">Register as administrator to manage your smoothie store</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}

          {adminExists && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md text-center">
              <p>Admin account already exists.</p>
              <button 
                onClick={() => navigate('/login')}
                className="mt-2 font-medium text-green-600 hover:text-green-500 underline"
              >
                Go to Login Page
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={adminExists}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={adminExists}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password (min 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                disabled={adminExists}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={adminExists}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Confirm your password"
              />
            </div>

            {!adminExists && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> You are registering as an administrator with full access to manage the smoothie store.
                </p>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isLoading || adminExists}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Admin Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Admin Account
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Already have an admin account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;