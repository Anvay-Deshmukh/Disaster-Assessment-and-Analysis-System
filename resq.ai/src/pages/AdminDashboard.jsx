import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FiFilter, FiCalendar,FiChevronDown, FiAlertTriangle, FiUsers , FiClock,FiChevronUp, FiPlus, FiUserPlus, FiActivity } from 'react-icons/fi';

// Region and state data
const regions = [
  {
    name: 'Northern',
    states: [
      'Jammu & Kashmir',
      'Himachal Pradesh',
      'Punjab',
      'Uttarakhand',
      'Haryana',
      'Delhi',
      'Uttar Pradesh',
      'Ladakh'
    ]
  },
  {
    name: 'Western',
    states: [
      'Rajasthan',
      'Gujarat',
      'Goa',
      'Maharashtra'
    ]
  },
  {
    name: 'Southern',
    states: [
      'Karnataka',
      'Kerala',
      'Tamil Nadu',
      'Andhra Pradesh',
      'Telangana'
    ]
  },
  {
    name: 'Eastern',
    states: [
      'Bihar',
      'Jharkhand',
      'Odisha',
      'West Bengal'
    ]
  },
  {
    name: 'Northeastern',
    states: [
      'Assam',
      'Sikkim',
      'Arunachal Pradesh',
      'Nagaland',
      'Manipur',
      'Mizoram',
      'Tripura',
      'Meghalaya'
    ]
  },
  {
    name: 'Central',
    states: [
      'Madhya Pradesh',
      'Chhattisgarh'
    ]
  }
];

// District data for key states (simplified for demonstration)
const stateDistricts = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Kolhapur', 'Ratnagiri'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Kutch', 'Bhavnagar'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Palakkad', 'Idukki'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Vellore'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Allahabad', 'Agra', 'Gorakhpur'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur', 'Dhubri']
};

// Sample data for disaster management dashboard
const sosData = [
  { name: 'Mon', critical: 12, high: 8, medium: 15 },
  { name: 'Tue', critical: 8, high: 5, medium: 10 },
  { name: 'Wed', critical: 15, high: 10, medium: 18 },
  { name: 'Thu', critical: 9, high: 6, medium: 12 },
  { name: 'Fri', critical: 18, high: 12, medium: 20 },
  { name: 'Sat', critical: 22, high: 15, medium: 25 },
  { name: 'Sun', critical: 10, high: 7, medium: 14 },
];

const responseTimeData = [
  { name: 'Jan', avgResponse: 45, target: 30 },
  { name: 'Feb', avgResponse: 42, target: 30 },
  { name: 'Mar', avgResponse: 38, target: 30 },
  { name: 'Apr', avgResponse: 35, target: 30 },
  { name: 'May', avgResponse: 32, target: 30 },
  { name: 'Jun', avgResponse: 28, target: 30 },
];

const disasterTypeData = [
  { name: 'Floods', value: 35 },
  { name: 'Earthquakes', value: 25 },
  { name: 'Landslides', value: 20 },
  { name: 'Fires', value: 15 },
  { name: 'Others', value: 5 },
];

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD166', '#A5A5A5'];

const recentAlerts = [
  { id: 1, location: 'Mumbai, MH', type: 'Flood', severity: 'High', status: 'Active', time: '5 min ago' },
  { id: 2, location: 'Chennai, TN', type: 'Cyclone', severity: 'Critical', status: 'Active', time: '12 min ago' },
  { id: 3, location: 'Kerala', type: 'Landslide', severity: 'High', status: 'Active', time: '25 min ago' },
  { id: 4, location: 'Uttarakhand', type: 'Flash Flood', severity: 'Critical', status: 'Active', time: '42 min ago' },
  { id: 5, location: 'Assam', type: 'Flood', severity: 'Medium', status: 'Active', time: '1 hour ago' },
];

const teamStatus = [
  { id: 1, name: 'Mumbai Rescue', status: 'Deployed', members: 8, location: 'Mumbai, MH' },
  { id: 2, name: 'NDRF Team 1', status: 'On Standby', members: 10, location: 'Delhi' },
  { id: 3, name: 'SDRF Kerala', status: 'In Transit', members: 6, location: 'Kochi' },
  { id: 4, name: 'NDRF Team 2', status: 'Available', members: 12, location: 'Kolkata' },
];

// Sample data - in a real app, this would come from an API
const sampleAlerts = [
  { id: 1, location: 'Mumbai', state: 'Maharashtra', region: 'Western', district: 'Mumbai', type: 'Flood', severity: 'High', timestamp: '2023-05-15T10:30:00' },
  { id: 2, location: 'Pune', state: 'Maharashtra', region: 'Western', district: 'Pune', type: 'Earthquake', severity: 'Critical', timestamp: '2023-05-15T11:45:00' },
  { id: 3, location: 'Bangalore', state: 'Karnataka', region: 'Southern', district: 'Bangalore Urban', type: 'Fire', severity: 'High', timestamp: '2023-05-14T09:15:00' },
  { id: 4, location: 'Hyderabad', state: 'Telangana', region: 'Southern', district: 'Hyderabad', type: 'Cyclone', severity: 'Medium', timestamp: '2023-05-14T14:20:00' },
  { id: 5, location: 'Delhi', state: 'Delhi', region: 'Northern', district: 'New Delhi', type: 'Heat Wave', severity: 'Critical', timestamp: '2023-05-13T13:10:00' },
  { id: 6, location: 'Chennai', state: 'Tamil Nadu', region: 'Southern', district: 'Chennai', type: 'Flood', severity: 'High', timestamp: '2023-05-13T16:45:00' },
  { id: 7, location: 'Jaipur', state: 'Rajasthan', region: 'Western', district: 'Jaipur', type: 'Drought', severity: 'Medium', timestamp: '2023-05-12T10:00:00' },
];

const sampleResponseTeams = [
  { id: 1, name: 'Team Alpha', status: 'Deployed', location: 'Mumbai', state: 'Maharashtra', region: 'Western' },
  { id: 2, name: 'Team Beta', status: 'On Standby', location: 'Pune', state: 'Maharashtra', region: 'Western' },
  { id: 3, name: 'Team Gamma', status: 'In Transit', location: 'Bangalore', state: 'Karnataka', region: 'Southern' },
  { id: 4, name: 'Team Delta', status: 'Available', location: 'Hyderabad', state: 'Telangana', region: 'Southern' },
  { id: 5, name: 'Team Epsilon', status: 'Deployed', location: 'Delhi', state: 'Delhi', region: 'Northern' },
];

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [incidents, setIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignIncidentId, setAssignIncidentId] = useState(null);
  const [assignTeamId, setAssignTeamId] = useState('');
  const [assignEta, setAssignEta] = useState('30');
  const [reportAssignModalOpen, setReportAssignModalOpen] = useState(false);
  const [assignReportId, setAssignReportId] = useState(null);
  const [reportAssignTeamId, setReportAssignTeamId] = useState('');
  const [reportAssignEta, setReportAssignEta] = useState('30');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusReportId, setStatusReportId] = useState(null);
  const [updateStatusValue, setUpdateStatusValue] = useState('pending');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelIncidentId, setCancelIncidentId] = useState(null);
  const [cancelReason, setCancelReason] = useState('No teams available');
  const [currentDate] = useState(new Date());
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  
  // Filter data based on selected filters
  const filterData = (data) => {
    return data.filter(item => {
      const matchesRegion = !selectedRegion || item.region === selectedRegion;
      const matchesState = !selectedState || item.state === selectedState;
      const matchesDistrict = !selectedDistrict || item.district === selectedDistrict;
      return matchesRegion && matchesState && matchesDistrict;
    });
  };
  
  // Get filtered data
  const filteredAlerts = filterData(sampleAlerts);
  const filteredTeams = filterData(sampleResponseTeams);
  
  // Calculate statistics based on filtered data
  const criticalAlerts = filteredAlerts.filter(alert => alert.severity === 'Critical').length;
  const teamsDeployed = filteredTeams.filter(team => team.status === 'Deployed').length;
  const peopleAffected = filteredAlerts.length * 200; // Simplified calculation

  const generateChartData = () => {
    // Generate SOS data based on filtered alerts
    const last7Days = Array(7).fill().map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const sosData = last7Days.map(day => {
      const dayAlerts = filteredAlerts.filter(alert => {
        const alertDay = new Date(alert.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
        return alertDay === day;
      });
      
      return {
        name: day,
        critical: dayAlerts.filter(a => a.severity === 'Critical').length,
        high: dayAlerts.filter(a => a.severity === 'High').length,
        medium: dayAlerts.filter(a => a.severity === 'Medium').length
      };
    });

    // Generate response time data (simplified)
    const responseTimeData = last7Days.map((day, i) => ({
      name: day,
      avgResponse: 25 + Math.floor(Math.random() * 30), // Random between 25-55
      target: 30
    }));

    // Generate disaster type data
    const disasterTypes = [...new Set(filteredAlerts.map(a => a.type))];
    const disasterTypeData = disasterTypes.map(type => ({
      name: type,
      value: filteredAlerts.filter(a => a.type === type).length
    }));

    // If no data, show some default values
    if (disasterTypeData.length === 0) {
      disasterTypeData.push({ name: 'No data', value: 1 });
    }

    return { sosData, responseTimeData, disasterTypeData };
  };

  const { sosData, responseTimeData, disasterTypeData } = generateChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Update available states when region changes
  useEffect(() => {
    if (selectedRegion) {
      const region = regions.find(r => r.name === selectedRegion);
      setAvailableStates(region ? region.states : []);
      setSelectedState('');
      setSelectedDistrict('');
    }
  }, [selectedRegion]);

  // Update available districts when state changes
  useEffect(() => {
    if (selectedState) {
      setAvailableDistricts(stateDistricts[selectedState] || []);
      setSelectedDistrict('');
    }
  }, [selectedState]);

  // Load teams and incidents
  const fetchIncidents = async () => {
    try {
      setIncidentsLoading(true);
      const res = await axios.get(`${API_URL}/incidents`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setIncidents(res.data?.data?.incidents || []);
    } catch (e) {
      console.error(e);
      showToast('Failed to load incidents', 'error');
    } finally {
      setIncidentsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setTeams(res.data?.data?.teams || []);
    } catch (e) {
      // silent
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const res = await axios.get(`${API_URL}/reports`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setReports(res.data?.data?.reports || []);
    } catch (e) {
      console.error(e);
      showToast('Failed to load reports', 'error');
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchTeams();
    fetchReports();
  }, []);

  const openAssignModal = (incidentId) => {
    if (teams.length === 0) {
      showToast('No teams found. Create a team to assign this incident.', 'error');
      return;
    }
    setAssignIncidentId(incidentId);
    setAssignTeamId(teams[0]?._id || '');
    setAssignEta('30');
    setAssignModalOpen(true);
  };

  const openReportAssignModal = (reportId) => {
    if (teams.length === 0) {
      showToast('No teams found. Create a team to assign this report.', 'error');
      return;
    }
    setAssignReportId(reportId);
    setReportAssignTeamId(teams[0]?._id || '');
    setReportAssignEta('30');
    setReportAssignModalOpen(true);
  };

  const submitAssign = async () => {
    try {
      await axios.post(`${API_URL}/incidents/${assignIncidentId}/assign`, {
        teamId: assignTeamId,
        etaMinutes: assignEta ? parseInt(assignEta, 10) : undefined
      }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setAssignModalOpen(false);
      showToast('Incident assigned', 'success');
      fetchIncidents();
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to assign incident', 'error');
    }
  };

  const submitReportAssign = async () => {
    try {
      await axios.post(`${API_URL}/reports/${assignReportId}/assign`, {
        teamId: reportAssignTeamId,
        etaMinutes: reportAssignEta ? parseInt(reportAssignEta, 10) : undefined
      }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setReportAssignModalOpen(false);
      showToast('Report assigned to team', 'success');
      fetchReports();
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to assign report', 'error');
    }
  };

  const openStatusModal = (reportId, currentStatus) => {
    setStatusReportId(reportId);
    setUpdateStatusValue(currentStatus || 'pending');
    setResolutionNotes('');
    setStatusModalOpen(true);
  };

  const submitUpdateStatus = async () => {
    try {
      await axios.patch(`${API_URL}/reports/${statusReportId}/status`, {
        status: updateStatusValue,
        resolutionNotes: resolutionNotes || undefined
      }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setStatusModalOpen(false);
      showToast('Report status updated', 'success');
      fetchReports();
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const openCancelModal = (incidentId) => {
    setCancelIncidentId(incidentId);
    setCancelReason('No teams available');
    setCancelModalOpen(true);
  };

  const submitCancel = async () => {
    try {
      await axios.post(`${API_URL}/incidents/${cancelIncidentId}/cancel`, { reason: cancelReason }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setCancelModalOpen(false);
      showToast('Incident cancelled', 'success');
      fetchIncidents();
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to cancel incident', 'error');
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'deployed': return 'bg-red-500';
      case 'in transit': return 'bg-yellow-500';
      case 'on standby': return 'bg-blue-500';
      case 'available': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ResQ.AI Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="text-sm text-gray-400">
                  {format(currentDate, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                AD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Section */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Region Filter */}
            <div className="relative w-full md:w-64">
              <button
                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 rounded-lg text-left hover:bg-gray-600 transition-colors"
              >
                <span>{selectedRegion || 'Select Region'}</span>
                {showRegionDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <AnimatePresence>
                {showRegionDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-1 w-full bg-gray-700 rounded-lg shadow-lg overflow-hidden"
                  >
                    {regions.map((region) => (
                      <div
                        key={region.name}
                        className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                        onClick={() => {
                          setSelectedRegion(region.name);
                          setShowRegionDropdown(false);
                        }}
                      >
                        {region.name}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* State Filter */}
            <div className="relative w-full md:w-64">
              <button
                onClick={() => selectedRegion && setShowStateDropdown(!showStateDropdown)}
                disabled={!selectedRegion}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-colors ${
                  selectedRegion ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>{selectedState || 'Select State'}</span>
                {showStateDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <AnimatePresence>
                {showStateDropdown && availableStates.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-1 w-full bg-gray-700 rounded-lg shadow-lg overflow-y-auto max-h-60"
                  >
                    {availableStates.map((state) => (
                      <div
                        key={state}
                        className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                        onClick={() => {
                          setSelectedState(state);
                          setShowStateDropdown(false);
                        }}
                      >
                        {state}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* District Filter */}
            <div className="relative w-full md:w-64">
              <button
                onClick={() => selectedState && setShowDistrictDropdown(!showDistrictDropdown)}
                disabled={!selectedState}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-colors ${
                  selectedState ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>{selectedDistrict || 'Select District'}</span>
                {showDistrictDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <AnimatePresence>
                {showDistrictDropdown && availableDistricts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-1 w-full bg-gray-700 rounded-lg shadow-lg overflow-y-auto max-h-60"
                  >
                    {availableDistricts.map((district) => (
                      <div
                        key={district}
                        className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                        onClick={() => {
                          setSelectedDistrict(district);
                          setShowDistrictDropdown(false);
                        }}
                      >
                        {district}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear Filters Button */}
            {(selectedRegion || selectedState || selectedDistrict) && (
              <button
                onClick={() => {
                  setSelectedRegion('');
                  setSelectedState('');
                  setSelectedDistrict('');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Disaster Response Dashboard</h2>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border">
              <FiCalendar className="text-gray-500" />
              <span className="text-gray-700">{format(currentDate, 'MMMM d, yyyy')}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Active Alerts" 
              value={filteredAlerts.length} 
              change={`${Math.floor(Math.random() * 5) + 1} in last hour`} 
              isPositive={false} 
              icon={<FiAlertTriangle className="text-red-500" size={24} />}
              color="red"
            />
            <StatCard 
              title="Teams Deployed" 
              value={filteredTeams.filter(t => t.status === 'Deployed').length} 
              change={`${Math.floor(Math.random() * 3) + 1} in last hour`} 
              isPositive={true} 
              icon={<FiUsers className="text-blue-500" size={24} />}
              color="blue"
            />
            <StatCard 
              title="Avg. Response Time" 
              value={`${25 + Math.floor(Math.random() * 15)} mins`} 
              change={`${Math.floor(Math.random() * 20) + 1}% faster`} 
              isPositive={true} 
              icon={<FiClock className="text-green-500" size={24} />}
              color="green"
            />
            <StatCard 
              title="People Affected" 
              value={`${(filteredAlerts.length * 200).toLocaleString()}`} 
              change={`+${Math.floor(Math.random() * 100) + 50} today`} 
              isPositive={false} 
              icon={<FiUsers className="text-purple-500" size={24} />}
              color="purple"
            />
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="SOS Alerts (Last 7 Days)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sosData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="critical" stackId="a" fill="#FF6B6B" name="Critical" />
                  <Bar dataKey="high" stackId="a" fill="#FF9E7D" name="High" />
                  <Bar dataKey="medium" stackId="a" fill="#FFD166" name="Medium" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Response Time Trend">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={responseTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgResponse" stroke="#4ECDC4" fillOpacity={1} fill="url(#colorResponse)" name="Avg. Response" />
                  <Line type="monotone" dataKey="target" stroke="#FF6B6B" strokeDasharray="5 5" name="Target" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Disaster Types" className="lg:col-span-1">
              <div className="flex justify-center">
                <PieChart width={300} height={250}>
                  <Pie
                    data={disasterTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {disasterTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </ChartCard>

            <ChartCard title="Active Alerts" className="lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAlerts.length > 0 ? (
                      filteredAlerts.slice(0, 5).map((alert) => (
                        <tr key={alert.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{alert.location}, {alert.district}</div>
                            <div className="text-xs text-gray-500">{alert.state}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{alert.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="text-green-600">Active</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No alerts found for the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>

          {/* Reports Management */}
          <div className="mt-8">
            <ChartCard title="User Reports Management">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All Reports</h3>
                <button onClick={fetchReports} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">Refresh</button>
              </div>
              {reportsLoading ? (
                <div className="p-6 text-center text-gray-500">Loading reports...</div>
              ) : reports.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No reports submitted yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">People</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.map((rep) => (
                        <tr key={rep._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{rep.user?.name || rep.user?.email || 'User'}</div>
                            <div className="text-xs text-gray-500">{rep.user?.email || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rep.disasterType} • {rep.disasterSubType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{rep.location}</div>
                            <div className="text-xs text-gray-500">{rep.pincode}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rep.urgency}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rep.peopleAffected || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{rep.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rep.assignedTeam?.name ? `${rep.assignedTeam.name}${rep.etaMinutes ? ` • ${rep.etaMinutes}m` : ''}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(rep.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button onClick={() => openReportAssignModal(rep._id)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Assign</button>
                              <button onClick={() => openStatusModal(rep._id, rep.status)} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Update Status</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>
          </div>

          {/* Rescue Teams Status */}
          <div className="mt-8">
            <ChartCard title="Rescue Teams Status">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Teams</h3>
                <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = '/teams'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiUsers size={16} />
                  View All Teams
                </button>
                  <button
                    onClick={() => window.location.href = '/teams/create'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FiPlus size={16} />
                    Create Team
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeams.length > 0 ? (
                      filteredTeams.map((team) => (
                        <tr key={team.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <FiUsers className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{team.name}</div>
                                <div className="text-sm text-gray-500">{team.specialization?.join(', ') || 'General'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(team.status)} text-white`}>
                              {team.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {team.members || 0} / {team.capacity || 10}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{team.location}</div>
                            <div className="text-xs text-gray-500">{team.state}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.location.href = `/teams/${team.id}`}
                                className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                              >
                                View
                              </button>
                              <button
                                onClick={() => window.location.href = `/teams/${team.id}/edit`}
                                className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No teams found for the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>

          {/* Incidents Management */}
          <div className="mt-8">
            <ChartCard title="Incidents Management">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Incidents</h3>
                <button onClick={fetchIncidents} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">Refresh</button>
              </div>
              {incidentsLoading ? (
                <div className="p-6 text-center text-gray-500">Loading incidents...</div>
              ) : incidents.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No incidents available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Team</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {incidents.map((inc) => (
                        <tr key={inc._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{inc.title}</div>
                            <div className="text-xs text-gray-500">{inc.description || 'No description'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{inc.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inc.assignedTeam?.name || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inc.etaMinutes || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex gap-2">
                              <button onClick={() => openAssignModal(inc._id)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Assign</button>
                              <button onClick={() => openCancelModal(inc._id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Cancel</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>
          </div>

          {/* Report Assign Modal */}
          {reportAssignModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Report to Team</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Select Team</label>
                    <select
                      value={reportAssignTeamId}
                      onChange={(e) => setReportAssignTeamId(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      {teams.map(team => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">ETA (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={reportAssignEta}
                      onChange={(e) => setReportAssignEta(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setReportAssignModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
                  <button onClick={submitReportAssign} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Assign</button>
                </div>
              </div>
            </div>
          )}

          {/* Update Status Modal */}
          {statusModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Report Status</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Status</label>
                    <select
                      value={updateStatusValue}
                      onChange={(e) => setUpdateStatusValue(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Resolution Notes (optional)</label>
                    <textarea
                      rows="3"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setStatusModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
                  <button onClick={submitUpdateStatus} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Update</button>
                </div>
              </div>
            </div>
          )}

          {/* Assign Modal */}
          {assignModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Incident</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Select Team</label>
                    <select
                      value={assignTeamId}
                      onChange={(e) => setAssignTeamId(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      {teams.map(team => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">ETA (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={assignEta}
                      onChange={(e) => setAssignEta(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setAssignModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
                  <button onClick={submitAssign} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Assign</button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Modal */}
          {cancelModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Incident</h3>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Reason</label>
                  <textarea
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setCancelModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Back</button>
                  <button onClick={submitCancel} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Confirm Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Team Actions */}
          <div className="mt-8">
            <ChartCard title="Team Management Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FiUsers className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-medium text-blue-900 mb-2">Create New Team</h4>
                  <p className="text-sm text-blue-700 mb-4">Set up a new rescue team with members and specializations</p>
                  <button
                    onClick={() => window.location.href = '/teams/create'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Team
                  </button>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FiUserPlus className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-medium text-green-900 mb-2">Manage Members</h4>
                  <p className="text-sm text-green-700 mb-4">Add, remove, or reassign team members across all teams</p>
                  <button
                    onClick={() => window.location.href = '/teams'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Manage Teams
                  </button>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FiActivity className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-medium text-purple-900 mb-2">Team Analytics</h4>
                  <p className="text-sm text-purple-700 mb-4">View detailed analytics and performance metrics for all teams</p>
                  <button
                    onClick={() => window.location.href = '/teams/analytics'}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </ChartCard>
          </div>
          </div>
         </main>
         </div>
      
  );
};

// Reusable Components

const StatCard = ({ title, value, change, isPositive, icon, color = 'blue' }) => {
  const colorVariants = {
    red: 'bg-red-500/10 border-red-500/30',
    blue: 'bg-blue-500/10 border-blue-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
  };

  const iconColors = {
    red: 'text-red-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`${colorVariants[color] || 'bg-blue-500/10'} p-6 rounded-xl border backdrop-blur-sm`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{value}</p>
          <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium ${
            isPositive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            <span className="text-sm font-medium">{change}</span>
            <svg
              className={`w-3 h-3 ml-1 ${!isPositive && 'transform rotate-180'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className={`p-2 rounded-lg bg-opacity-20 ${iconColors[color] || 'bg-blue-500/20'}`}>
          {React.cloneElement(icon, { className: `${icon.props.className} ${iconColors[color] || 'text-blue-400'}` })}
        </div>
      </div>
    </motion.div>
  );
};

const ChartCard = ({ title, children, className = '' }) => (
  <div className={`bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm ${className}`}>
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    {children}
  </div>
);

export default AdminDashboard;