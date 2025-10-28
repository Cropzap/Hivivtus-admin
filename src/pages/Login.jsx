import { useState } from 'react';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';

const Login = ({ setIsLoggedIn }) => {
  // State to manage the input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State to handle loading and error messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state to true
    setError(null); // Clear any previous errors

    // The backend API URL for admin login
    const API_URL = import.meta.env.VITE_API_URL;
    const apiUrl = `${API_URL}admin/login`; 
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Simulating a network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful!', data);
        localStorage.setItem('authToken', data.token);
        // On successful login, update the state in the parent component
        setIsLoggedIn(true);
        // You would typically save the token here for later use
        // localStorage.setItem('token', data.token);
      } else {
        // Handle login failure
        const errorData = await response.json();
        setError(errorData.message || 'Login failed. Please check your credentials.');
        console.error('Login failed:', errorData);
      }
    } catch (err) {
      // Handle network errors or other exceptions
      setError('An error occurred. Please try again later.');
      console.error('Network error:', err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        {/* Form for login */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Input Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Display Error Message */}
          {error && (
            <div className="mt-2 text-sm text-red-600 text-center dark:text-red-400 animate-fade-in">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800 transition-colors duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                )}
              </span>
              {loading ? 'Logging in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
