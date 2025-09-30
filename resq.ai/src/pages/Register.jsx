import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, passwordConfirm } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, passwordConfirm);
      // Success toast and navigation are now handled by AuthContext
    } catch (err) {
      // Error toast is handled by AuthContext
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-white">
      <div className="bg-gray-900 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg 
                         bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg 
                         bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg 
                         bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              name="passwordConfirm"
              placeholder="Confirm your password"
              value={passwordConfirm}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg 
                         bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">Already have an account? </span>
          <Link to="/login" className="text-blue-400 hover:underline">
            Log In
          </Link>
        </div>

        <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
          <p className="font-medium mb-1">Note:</p>
          <p>Use <span className="font-mono">email@123gmail.com</span> for admin access</p>
          <p>Use <span className="font-mono">rescue@[1-10]gmail.com</span> for rescue team access</p>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ResQ.AI. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Register;
