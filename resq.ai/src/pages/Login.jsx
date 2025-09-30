import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // The success toast is now handled by AuthContext
    } catch (err) {
      // Error toast is handled by AuthContext
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-white">
      <div className="bg-gray-900 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login to Your Account
        </h2>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg 
                         bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg 
                         bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <div className="flex justify-end mt-1">
              <button
                type="button"
                className="text-sm text-blue-400 hover:underline"
                onClick={() => alert("Redirect to Forgot Password Page")}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Google Login Button - Disabled for now */}
        <button
          disabled={true}
          className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-600 py-2 rounded-lg font-semibold cursor-not-allowed opacity-50"
          title="Google login coming soon"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google (Coming Soon)
        </button>

        {/* Create Account Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">Don't have an account? </span>
          <Link to="/register" className="text-blue-400 hover:underline">
            Create Account
          </Link>
        </div>

        {/* Admin Access Note */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
          <p className="font-medium mb-1">Demo Access:</p>
          <p>Admin: email@123gmail.com / your-password</p>
          <p>Rescue Team: rescue@1gmail.com / your-password</p>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} ResQ.AI. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
