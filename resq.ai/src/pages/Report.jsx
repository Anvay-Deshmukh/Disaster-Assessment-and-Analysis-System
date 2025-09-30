 import React, { useEffect, useMemo, useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import axios from 'axios';
 import { useToast } from '../context/ToastContext';
 import { useAuth } from '../context/AuthContext';
 import { FiPlus, FiClock, FiMapPin, FiUsers, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
 import ReportModal from '../components/ReportModal';
import { data } from 'react-router-dom';

 const API_URL = 'http://localhost:5000/api';

 const StatusBadge = ({ status }) => {
   const map = {
     pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
     live: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
     completed: 'bg-green-500/20 text-green-300 border border-green-500/30',
     cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
   };
   return (
     <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-700 text-gray-300'}`}>
       {status.charAt(0).toUpperCase() + status.slice(1)}
     </span>
   );
 };

 const ReportCard = ({ item }) => {
   return (
     <motion.div
       layout
       className="rounded-xl bg-gray-800/80 border border-gray-700 p-4 shadow hover:shadow-lg transition-shadow"
     >
       <div className="flex items-start justify-between">
         <div>
           <div className="flex items-center gap-2">
             <FiAlertTriangle className="text-red-400" />
             <h4 className="text-white font-semibold">
               {item.disasterType} • {item.disasterSubType}
             </h4>
           </div>
           <p className="text-sm text-gray-300 mt-2 line-clamp-3">{item.description}</p>
         </div>
         <StatusBadge status={item.status} />
       </div>
       <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-300">
         <div className="flex items-center gap-2">
           <FiMapPin className="text-gray-400" />
           <span>{item.location} • {item.pincode}</span>
         </div>
         <div className="flex items-center gap-2">
           <FiUsers className="text-gray-400" />
           <span>Affected ~ {item.peopleAffected}</span>
         </div>
         <div className="flex items-center gap-2">
           <FiClock className="text-gray-400" />
           <span>{new Date(item.createdAt).toLocaleString()}</span>
         </div>
         {item.urgency && (
           <div className="flex items-center gap-2">
             <span className="text-xs px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-300">
               {item.urgency}
             </span>
           </div>
         )}
       </div>
       {item.assignedTeam && (
         <div className="mt-3 text-xs text-gray-400">
           Assigned to: <span className="text-gray-200">{item.assignedTeam?.name}</span>
           {item.etaMinutes ? ` • ETA ${item.etaMinutes}m` : ''}
         </div>
       )}
     </motion.div>
   );
 };

 const Column = ({ title, color, items }) => (
   <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4">
     <div className="flex items-center justify-between mb-3">
       <h3 className="font-semibold text-white">{title}</h3>
       <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{items.length}</span>
     </div>
     <div className="space-y-3">
       <AnimatePresence>
         {items.map((r) => (
           <ReportCard key={r._id} item={r} />
         ))}
       </AnimatePresence>
       {items.length === 0 && (
         <div className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-700 rounded-xl">
           No items
         </div>
       )}
     </div>
   </div>
 );

 const Report = () => {
   const { currentUser } = useAuth();
   const { showToast } = useToast();
   const [isOpen, setIsOpen] = useState(false);
   const [loading, setLoading] = useState(false);
   const [reports, setReports] = useState([]);
   const [refreshKey, setRefreshKey] = useState(0);

   const fetchReports = async () => {
     try {
       setLoading(true);
       const res = await axios.get(`${API_URL}/reports`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
       });
       setReports(res.data?.data?.reports || []);
     } catch (e) {
       console.error(e);
       showToast(e.response?.data?.message || 'Failed to load reports', 'error');
     } finally {
       setLoading(false);
     }
   };

   useEffect(() => {
     fetchReports();
   }, [refreshKey]);

   // Poll every 20s
   useEffect(() => {
     const id = setInterval(() => setRefreshKey((k) => k + 1), 20000);
     return () => clearInterval(id);
   }, []);

   const grouped = useMemo(() => {
     const g = { pending: [], live: [], completed: [] };
     (reports || []).forEach((r) => {
       if (g[r.status]) g[r.status].push(r);
     });
     return g;
   }, [reports]);

   const handleSubmit = async (data) => {
     try {
       await axios.post(`${API_URL}/reports`, data, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
       });
       showToast('Report submitted successfully', 'success');
       setRefreshKey((k) => k + 1);
     } catch (e) {
       console.error(e);
       showToast(e.response?.data?.message || 'Failed to submit report', 'error');
     }
   };

   return (
     <div className="min-h-screen">
       <div className="max-w-7xl mx-auto">
         <div className="flex items-center justify-between mb-6">
           <div>
             <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
               Report an Incident
             </h1>
             <p className="text-gray-400 mt-1">Track your incident through Pending, Live and Completed stages.</p>
           </div>
           <div className="flex items-center gap-3">
             <button
               onClick={() => setRefreshKey((k) => k + 1)}
               className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 flex items-center gap-2"
               disabled={loading}
             >
               <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
             </button>
             <button
               onClick={() => setIsOpen(true)}
               className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-2 shadow"
             >
               <FiPlus /> New Report
             </button>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Column title="Pending" color="bg-yellow-500/20 text-yellow-300" items={grouped.pending} />
           <Column title="Live" color="bg-blue-500/20 text-blue-300" items={grouped.live} />
           <Column title="Completed" color="bg-green-500/20 text-green-300" items={grouped.completed} />
         </div>
       </div>

       <ReportModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSubmit={handleSubmit} />
     </div>
   );
 };

 export default Report;

