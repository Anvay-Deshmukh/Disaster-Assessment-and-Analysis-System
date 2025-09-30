import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BsBell,
  BsQuestionCircle,
  BsExclamationTriangle,
  BsFileEarmarkText,
  BsBoxArrowRight,
  BsPeople,
  BsGear,
  BsShieldCheck,
  BsPersonCircle,
  BsHouse,
  BsClipboardData,
  BsGraphUp,
  BsMap,
  BsCollection,
  BsChevronDown,
  BsList,
  BsX
} from 'react-icons/bs';

// Role-based navigation configuration
const navConfig = {
  admin: [
    { name: 'Dashboard', path: '/admin-dashboard', icon: <BsHouse className="mr-2" /> },
    { name: 'Users', path: '/admin/users', icon: <BsPeople className="mr-2" /> },
    { name: 'Reports', path: '/admin/reports', icon: <BsClipboardData className="mr-2" /> },
    { name: 'Map', path: '/user/map', icon: <BsMap className="mr-2" /> },
    { name: 'Analytics', path: '/analytics', icon: <BsGraphUp className="mr-2" /> },
  ],
  rescue: [
    { name: 'Dashboard', path: '/rescue-dashboard', icon: <BsHouse className="mr-2" /> },
    { name: 'Alerts', path: '/admin/alerts', icon: <BsExclamationTriangle className="mr-2" /> },
    { name: 'Map', path: '/user/map', icon: <BsMap className="mr-2" /> }, // Updated path
    { name: 'Resources', path: '/rescue/resources', icon: <BsCollection className="mr-2" /> },
  ],
  user: [
    { name: 'UserDashboard', path: '/dashboard', icon: <BsFileEarmarkText className="mr-2" /> },
    { name: 'Report', path: '/report', icon: <BsFileEarmarkText className="mr-2" /> },
    { name: 'Map', path: '/user/map', icon: <BsMap className="mr-2" /> },
    { name: 'Alerts', path: '/alerts', icon: <BsExclamationTriangle className="mr-2" /> },
    { name: 'Help Status', path: '/citizen', icon: <BsClipboardData className="mr-2" /> }
  ]
};

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const userRole = currentUser?.role || 'user';
  const isAuthenticated = !!currentUser;
  const isAdmin = userRole === 'admin';
  const isRescue = userRole === 'rescue';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // User navigation items
  const userNavigation = [
    { name: 'Your Profile', path: '/profile', icon: <BsPersonCircle className="mr-2" /> },
    { name: 'Settings', path: '/settings', icon: <BsGear className="mr-2" /> },
    ...(isAdmin ? [{ name: 'Admin Settings', path: '/admin/settings', icon: <BsShieldCheck className="mr-2" /> }] : []),
    { name: 'Sign out', action: handleLogout, icon: <BsBoxArrowRight className="mr-2" /> }
  ];
  

  // Get navigation items based on role
  const getNavItems = () => {
    return navConfig[userRole] || [];
  };

  if (loading) {
    return (
      <nav className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-2xl font-bold text-teal-400">RESQ.AI</div>
            <div className="text-gray-400">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  // Mobile menu component
  const MobileMenu = () => (
    <div className="md:hidden">
      {isMobileMenuOpen && (
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-gray-700">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <div className="mt-3">
                  <p className="text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-teal-400 hover:text-teal-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {item.name}
                  </div>
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center px-5">
                  <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium">
                    {currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {currentUser?.name || 'User'}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {currentUser?.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path || '#'}
                      onClick={(e) => {
                        if (item.action) {
                          e.preventDefault();
                          item.action();
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        {item.icon}
                        {item.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-gray-900 text-gray-200 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <BsX className="block h-6 w-6" />
              ) : (
                <BsList className="block h-6 w-6" />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-teal-400 hover:text-teal-300">
              RESQ.AI
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                  Home
                </Link>
                <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                  About
                </Link>
                <Link to="/contact" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                  Contact
                </Link>
              </>
            ) : (
              getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === item.path
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))
            )}
          </div>

          {/* Right side - Auth */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="ml-4 flex items-center md:ml-6">
                {/* Notifications */}
                <button
                  onClick={() => navigate('/notifications')}
                  className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none relative"
                >
                  <span className="sr-only">View notifications</span>
                  <BsBell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>

                {/* Profile dropdown */}
                <div className="ml-3 relative" ref={dropdownRef}>
                  <div>
                    <button
                      type="button"
                      className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                      id="user-menu"
                      aria-expanded="false"
                      aria-haspopup="true"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium">
                        {currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="ml-2 text-sm font-medium text-white">
                        {currentUser?.name || currentUser?.email?.split('@')[0]}
                      </span>
                      <BsChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {isUserDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {currentUser?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="py-1">
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path || '#'}
                            onClick={(e) => {
                              if (item.action) {
                                e.preventDefault();
                                item.action();
                              }
                              setIsUserDropdownOpen(false);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <div className="flex items-center">
                              {item.icon}
                              {item.name}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      
  {/* Mobile menu */ }
{
  isOpen && (
    <div className="md:hidden bg-gray-800" onClick={(e) => e.stopPropagation()}>
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <Link
          to="/"
          className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={() => setIsOpen(false)}
        >
          Home
        </Link>
        <Link
          to="/citizen"
          className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={() => setIsOpen(false)}
        >
          Citizen
        </Link>

        {currentUser ? (
          <>
            {isAdmin && (
              <Link
                to="/admin-dashboard"
                className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            {isRescue && (
              <Link
                to="/rescue-dashboard"
                className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Rescue Dashboard
              </Link>
            )}

            {!isAdmin && !isRescue && (
              <>
                <Link
                  to="/report"
                  className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Report Incident
                </Link>
                <Link
                  to="/alerts"
                  className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Emergency Alerts
                </Link>
              </>
            )}

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <BsPersonCircle className="h-10 w-10 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {currentUser.name || 'User'}
                  </div>
                  <div className="text-sm font-medium text-gray-400">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md textBase font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md textBase font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md textBase font-medium text-red-400 hover:text-white hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="ml-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-300 hover:text-white focus:outline-none"
        >
          {isOpen ? "✖" : "☰"}
        </button>
      </div>
    </div>
  )
}

{/* Mobile Dropdown Menu */ }
{
  isOpen && (
    <div className="md:hidden bg-gray-800 px-2 pt-2 pb-3 space-y-1">
      {!currentUser ? (
        <>
          <Link
            to="/"
            className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/citizen"
            className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Citizen
          </Link>
          <Link
            to="/rescue"
            className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Rescue
          </Link>
          <div className="pt-4 border-t border-gray-700">
            <Link
              to="/login"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </div>
        </>
      ) : isAdmin ? (
        <>
          <div className="px-3 py-2 text-teal-400 font-semibold border-b border-gray-700 mb-2">
            Admin Panel
          </div>
          <Link
            to="/admin/dashboard"
            className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:bg-gray-700 bg-teal-900/30"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <BsFileEarmarkText className="mr-2" /> Admin Dashboard
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <BsPeople className="mr-2" /> Manage Users
            </div>
          </Link>
          <Link
            to="/admin/reports"
            className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <BsClipboardData className="mr-2" /> All Reports
            </div>
          </Link>
          <Link
            to="/analytics"
            className="block px-3 py-2 rounded-md textBase font-medium text-gray-300 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <BsGraphUp className="mr-2" /> Analytics
            </div>
          </Link>
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <BsBoxArrowRight className="mr-2" /> Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="px-3 py-2 text-teal-400 font-semibold border-b border-gray-700 mb-2">
            Menu
          </div>
          <Link
            to="/alerts"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-3 py-2 rounded hover:bg-gray-700 hover:text-teal-400"
          >
            <BsExclamationTriangle className="mr-2" /> Emergency Alerts
          </Link>
          <Link
            to="/report"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-3 py-2 rounded hover:bg-gray-700 hover:text-teal-400"
          >
            <BsFileEarmarkText className="mr-2" /> Report Incident
          </Link>
          <Link
            to="/my-reports"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-3 py-2 rounded hover:bg-gray-700 hover:text-teal-400"
          >
            <BsFileEarmarkText className="mr-2" /> My Reports
          </Link>
          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-3 py-2 rounded hover:bg-gray-700 hover:text-teal-400"
          >
            <BsBell className="mr-2" /> Notifications
          </Link>
          <Link
            to="/evacuation"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-3 py-2 rounded hover:bg-gray-700 hover:text-teal-400"
          >
            <BsGeoAlt className="mr-2" /> Evacuation Routes
          </Link>
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <BsBoxArrowRight className="mr-2" /> Logout
            </button>
          </div>
          <div className="text-xs text-gray-400 px-3 py-1">
            Logged in as: {currentUser?.email}
          </div>
        </>
      )}
    </div>
  )}
    </nav >

  );
}

export default Navbar;
