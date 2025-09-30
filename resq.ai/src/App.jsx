import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SOSProvider } from './context/SOSContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SOSButton from './components/SOSButton';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Citizen from './pages/Citizen';
import RescueDashboard from './pages/RescueDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import AdminReport from './pages/AdminReport';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ToastTest from './components/ToastTest';
import Contact from './pages/Contact';
import About from './pages/About';
import Map from './pages/user/Map';
//import Alerts from './pages/user/Alerts';

// Team Management Pages
import Teams from './pages/Teams';
import MyTeams from './pages/MyTeams';
import CreateTeam from './pages/CreateTeam';
import TeamAnalytics from './pages/TeamAnalytics';

// A wrapper to handle authentication redirects
const AuthWrapper = ({ children }) => {
  const { currentUser } = useAuth();
  
  // If user is logged in, redirect to appropriate dashboard
  if (currentUser) {
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (currentUser.role === 'rescue') {
      return <Navigate to="/rescue-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col">
      <ToastProvider>
        <Router>
          <AuthProvider>
            <SOSProvider>
              <Navbar />
              <div className="flex-grow p-4 md:p-6">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/test-toast" element={<ToastTest />} />
                  
                  {/* Protected Citizen Route */}
                  <Route path="/citizen" element={
                    <ProtectedRoute>
                      <Citizen />
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected User Report Route */}
                  <Route path="/report" element={
                    <ProtectedRoute>
                      <Report />
                    </ProtectedRoute>
                  } />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={
                    <AuthWrapper>
                      <Login />
                    </AuthWrapper>
                  } />
                  <Route path="/register" element={
                    <AuthWrapper>
                      <Register />
                    </AuthWrapper>
                  } />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin-dashboard" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin/reports" element={
                    <ProtectedRoute>
                      <AdminReport />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin-dashboard/*" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/rescue-dashboard/*" element={
                    <ProtectedRoute allowedRoles={['rescue']}>
                      <RescueDashboard />
                    </ProtectedRoute>
                  }/>

                   
                  {/* Team Management Routes */}
                  <Route path="/teams" element={
                    <ProtectedRoute allowedRoles={['admin', 'rescue']}>
                      <Teams />
                    </ProtectedRoute>
                  } />

                  <Route path="/my-teams" element={
                    <ProtectedRoute allowedRoles={['admin', 'rescue']}>
                      <MyTeams />
                    </ProtectedRoute>
                  } />

                  <Route path="/teams/create" element={
                    <ProtectedRoute allowedRoles={['admin', 'rescue']}>
                      <CreateTeam />
                    </ProtectedRoute>
                  } />

                  <Route path="/teams/analytics" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <TeamAnalytics />
                    </ProtectedRoute>
                  } />

                  <Route path="/teams/:teamId" element={
                    <ProtectedRoute allowedRoles={['admin', 'rescue']}>
                      <Teams />
                    </ProtectedRoute>
                  } />

                  <Route path="/user/map" element={<Map />} />
                  

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
              <SOSButton />
            </SOSProvider>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </div>
  );
}

export default App;
