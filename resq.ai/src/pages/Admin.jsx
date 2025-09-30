import { useContext, useState } from "react";
import { SOSContext } from "../context/SOSContext";

function Admin() {
  const { requests, missions, updateMissionStatus } = useContext(SOSContext);
  const [newMission, setNewMission] = useState({ team: "", location: "", status: "Pending" });
  const [activity, setActivity] = useState([
    { id: 1, text: "✅ Admin panel initialized", time: new Date().toLocaleTimeString() },
  ]);

  const handleAddMission = (e) => {
    e.preventDefault();
    const newId = missions.length + 1;
    const mission = { id: newId, ...newMission };

    setActivity([
      { id: activity.length + 1, text: `🆕 Mission assigned: ${mission.team} → ${mission.location}`, time: new Date().toLocaleTimeString() },
      ...activity,
    ]);

    setNewMission({ team: "", location: "", status: "Pending" });
  };

  const handleStatusUpdate = (id, newStatus) => {
    updateMissionStatus(id, newStatus);
    setActivity([
      { id: activity.length + 1, text: `📌 Mission ${id} marked as ${newStatus}`, time: new Date().toLocaleTimeString() },
      ...activity,
    ]);
  };

  const getStatusBadge = (status) => {
    if (status === "Accepted") return "bg-yellow-600 text-yellow-200";
    if (status === "En Route") return "bg-blue-600 text-blue-200";
    if (status === "Completed") return "bg-green-600 text-green-200";
    if (status === "Pending") return "bg-red-600 text-red-200";
    return "bg-gray-600 text-gray-200";
  };

  // Stats
  const ongoingCount = missions.filter((m) => m.status === "En Route" || m.status === "Accepted").length;
  const completedCount = missions.filter((m) => m.status === "Completed").length;
  const pendingCount = missions.filter((m) => m.status === "Pending").length;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-teal-400">🖥️ Admin Dashboard</h2>
        <p className="mt-2 text-gray-300 max-w-2xl mx-auto">
          Monitor SOS requests, manage rescue teams, and track live missions in real-time.
        </p>
      </section>

      {/* Stats Overview */}
      <section className="grid md:grid-cols-3 gap-6 text-center">
        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-yellow-400">Ongoing</h3>
          <p className="text-3xl font-bold">{ongoingCount}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-green-400">Completed</h3>
          <p className="text-3xl font-bold">{completedCount}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-red-400">Pending</h3>
          <p className="text-3xl font-bold">{pendingCount}</p>
        </div>
      </section>

      {/* Pending SOS */}
      <section>
        <h3 className="text-2xl font-bold text-red-400 mb-4">🚨 Pending SOS Requests</h3>
        {requests.length === 0 ? (
          <p className="text-gray-400">No pending SOS requests.</p>
        ) : (
          <ul className="space-y-2">
            {requests.map((r) => (
              <li key={r.id} className="bg-gray-800 p-3 rounded-lg shadow">
                <p><strong className="text-teal-400">📍 Location:</strong> {r.location}</p>
                <p><strong className="text-teal-400">💬 Message:</strong> {r.message}</p>
                <p><strong className="text-teal-400">📞 Contact:</strong> {r.contact}</p>
                <p className="text-sm text-gray-400">⏰ {r.time}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Missions Table */}
      <section>
        <h3 className="text-2xl font-bold text-teal-400 mb-4">📋 Active Missions</h3>
        {missions.length === 0 ? (
          <p className="text-gray-400">No missions assigned.</p>
        ) : (
          <table className="w-full border border-gray-700">
            <thead>
              <tr className="bg-gray-800 text-gray-300">
                <th className="p-2 border border-gray-700">Mission ID</th>
                <th className="p-2 border border-gray-700">Location</th>
                <th className="p-2 border border-gray-700">Message</th>
                <th className="p-2 border border-gray-700">Team</th>
                <th className="p-2 border border-gray-700">Status</th>
                <th className="p-2 border border-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800">
                  <td className="p-2 border border-gray-700">{m.id}</td>
                  <td className="p-2 border border-gray-700">{m.location}</td>
                  <td className="p-2 border border-gray-700">{m.message}</td>
                  <td className="p-2 border border-gray-700">{m.acceptedBy || "Unassigned"}</td>
                  <td className="p-2 border border-gray-700">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusBadge(m.status)}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-2 border border-gray-700 space-x-2">
                    {m.status !== "Completed" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(m.id, "En Route")}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                          🚐 En Route
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(m.id, "Completed")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          ✅ Complete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Add Mission Form */}
      <section className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">➕ Assign New Mission</h3>
        <form onSubmit={handleAddMission} className="space-y-3">
          <input
            type="text"
            placeholder="Team Name"
            value={newMission.team}
            onChange={(e) => setNewMission({ ...newMission, team: e.target.value })}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={newMission.location}
            onChange={(e) => setNewMission({ ...newMission, location: e.target.value })}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
          />
          <select
            value={newMission.status}
            onChange={(e) => setNewMission({ ...newMission, status: e.target.value })}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
          >
            <option>Pending</option>
            <option>Accepted</option>
            <option>En Route</option>
            <option>Completed</option>
          </select>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg shadow font-semibold"
          >
            Assign Mission
          </button>
        </form>
      </section>

      {/* Activity Feed */}
      <section className="max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">📡 Recent Activity</h3>
        <ul className="space-y-2">
          {activity.map((a) => (
            <li key={a.id} className="bg-gray-800 p-3 rounded-lg shadow flex justify-between">
              <span className="text-gray-300">{a.text}</span>
              <span className="text-gray-500 text-sm">{a.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Admin;
