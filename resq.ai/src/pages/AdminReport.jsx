import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const API_URL = 'http://localhost:5000/api';

const Badge = ({ children }) => (
  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
    {children}
  </span>
);

const Card = ({ title, children, right }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

export default function AdminReport() {
  const { showToast } = useToast();

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [teams, setTeams] = useState([]);

  const [reportAssignModalOpen, setReportAssignModalOpen] = useState(false);
  const [assignReportId, setAssignReportId] = useState(null);
  const [reportAssignTeamId, setReportAssignTeamId] = useState('');
  const [reportAssignEta, setReportAssignEta] = useState('30');

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusReportId, setStatusReportId] = useState(null);
  const [updateStatusValue, setUpdateStatusValue] = useState('pending');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const res = await axios.get(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReports(res.data?.data?.reports || []);
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to load reports', 'error');
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTeams(res.data?.data?.teams || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchTeams();
  }, []);

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

  const submitReportAssign = async () => {
    try {
      await axios.post(
        `${API_URL}/reports/${assignReportId}/assign`,
        {
          teamId: reportAssignTeamId,
          etaMinutes: reportAssignEta ? parseInt(reportAssignEta, 10) : undefined,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
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
      await axios.patch(
        `${API_URL}/reports/${statusReportId}/status`,
        {
          status: updateStatusValue,
          resolutionNotes: resolutionNotes || undefined,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setStatusModalOpen(false);
      showToast('Report status updated', 'success');
      fetchReports();
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Admin • Reports
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage user-submitted incident reports</p>
          </div>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg"
          >
            Refresh
          </button>
        </div>

        <Card
          title="All Reports"
          right={
            <div className="text-sm text-gray-300">
              Total: <span className="font-semibold">{reports.length}</span>
            </div>
          }
        >
          {reportsLoading ? (
            <div className="p-6 text-center text-gray-400">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No reports submitted yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reporter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Urgency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">People</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {reports.map((rep) => (
                    <tr key={rep._id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{rep.user?.name || rep.user?.email || 'User'}</div>
                        <div className="text-xs text-gray-400">{rep.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {rep.disasterType} • {rep.disasterSubType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-200">{rep.location}</div>
                        <div className="text-xs text-gray-500">{rep.pincode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{rep.urgency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{rep.peopleAffected || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        <Badge>{rep.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {rep.assignedTeam?.name ? `${rep.assignedTeam.name}${rep.etaMinutes ? ` • ${rep.etaMinutes}m` : ''}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{new Date(rep.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openReportAssignModal(rep._id)}
                            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => openStatusModal(rep._id, rep.status)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
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
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
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
              <button onClick={() => setReportAssignModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
                Cancel
              </button>
              <button onClick={submitReportAssign} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                Assign
              </button>
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
              <button onClick={() => setStatusModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
                Cancel
              </button>
              <button onClick={submitUpdateStatus} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
