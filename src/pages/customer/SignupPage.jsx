import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApiService from '../../services/AuthApiService'; // Adjust path as needed

export default function SignUpPage() {
  const [form, setForm] = useState({
    username: '', // Added username field
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // For success messages
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // Client-side validation
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    // Optional: Add more specific password strength validation here if needed

    try {
      const response = await authApiService.registerCustomer(
        form.email,
        form.username,
        form.password
      );

      console.log('Registration response:', response);

      if (response.success) {
        setSuccessMessage(response.messages || 'Registration successful! Please log in.');
        // Optionally, clear the form
        setForm({ username: '', email: '', password: '', confirmPassword: '' });
        // Navigate to login page after a short delay or let user click
        setTimeout(() => {
          navigate('/login');
        }, 3000); // Navigate after 3 seconds
      } else {
        // If success is false, the API should ideally send a message in 'messages'
        setError(response.messages || 'Registration failed. Please try again.');
      }
    } catch (apiError) {
      console.error('Registration failed:', apiError);
      setError(apiError.data?.message || apiError.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex justify-center items-start pt-20 bg-beige px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900">Create your Account</h2>
        {error && <p className="text-red-600 text-center mb-4 py-2 bg-red-100 rounded">{error}</p>}
        {successMessage && <p className="text-green-600 text-center mb-4 py-2 bg-green-100 rounded">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
              placeholder="Enter your password (min. 6 characters)" // Example placeholder
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
              placeholder="Confirm your password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-3 rounded-md font-semibold hover:bg-gray-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}