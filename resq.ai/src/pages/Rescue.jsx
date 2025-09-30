import { useContext, useState } from "react";
import { SOSContext } from "../context/SOSContext";

function Rescue() {
  const { requests, missions, acceptMission, updateMissionStatus } = useContext(SOSContext);
  const [activity, setActivity] = useState([]);

  const handleAccept = (req) => {
    acceptMission(req.id, "Rescue Team A"); // assign to team
    logActivity(`✅ Accepted SOS at ${req.location}`);
  };

  const handleUpdateStatus = (missionId, newStatus) => {
    updateMissionStatus(missionId, newStatus);
    logActivity(`📌 Mission ${missionId} → ${newStatus}`);
  };

  const logActivity = (text) => {
    setActivity([
      { id: activity.length + 1, text, time: new Date().toLocaleTimeString() },
      ...activity,
    ]);
  };

  const pendingCount = requests.length;
  const activeCount = missions.filter((m) => m.status !== "Completed").length;
  const completedCount = missions.filter((m) => m.status === "Completed").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted": return "bg-yellow-600 text-yellow-200";
      case "En Route": return "bg-blue-600 text-blue-200";
      case "Completed": return "bg-green-600 text-green-200";
      default: return "bg-gray-600 text-gray-200";
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-teal-400">🛟 Rescue Team Dashboard</h2>
        <p className="mt-2 text-gray-300 max-w-2xl mx-auto">
          Manage SOS alerts, accept missions, and track rescue status in real-time.
        </p>
      </section>

      {/* Stats Overview */}
      <section className="grid md:grid-cols-3 gap-6 text-center">
        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-yellow-400">Pending SOS</h3>
          <p className="text-3xl font-bold">{pendingCount}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-blue-400">Active Missions</h3>
          <p className="text-3xl font-bold">{activeCount}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-green-400">Completed</h3>
          <p className="text-3xl font-bold">{completedCount}</p>
        </div>
      </section>

      {/* Incoming Requests */}
      <section>
        <h3 className="text-2xl font-bold text-red-400 mb-4">🚨 Incoming SOS Requests</h3>
        {requests.length === 0 ? (
          <p className="text-gray-400">No pending requests.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((req) => (
              <li key={req.id} className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow-lg hover:scale-[1.01] transition">
                <p><strong className="text-teal-400">📍 Location:</strong> {req.location}</p>
                <p><strong className="text-teal-400">📝 Message:</strong> {req.message}</p>
                <p><strong className="text-teal-400">📞 Contact:</strong> {req.contact}</p>
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={() => handleAccept(req)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => logActivity(`❌ Rejected SOS from ${req.location}`)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    ❌ Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Active Missions */}
      <section>
        <h3 className="text-2xl font-bold text-green-400 mb-4">📌 Active Missions</h3>
        {missions.length === 0 ? (
          <p className="text-gray-400">No active missions.</p>
        ) : (
          <ul className="space-y-3">
            {missions.map((m) => (
              <li key={m.id} className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow-lg hover:scale-[1.01] transition">
                <div className="flex justify-between items-center">
                  <div>
                    <p><strong className="text-teal-400">📍 Location:</strong> {m.location}</p>
                    <p><strong className="text-teal-400">📝 Message:</strong> {m.message}</p>
                    <p><strong className="text-teal-400">📞 Contact:</strong> {m.contact}</p>
                    <p><strong className="text-teal-400">👨‍🚒 Team:</strong> {m.acceptedBy}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(m.status)}`}>
                    {m.status}
                  </span>
                </div>
                <div className="mt-3 flex space-x-3">
                  {m.status === "Accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(m.id, "En Route")}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                    >
                      🚓 Mark En Route
                    </button>
                  )}
                  {m.status === "En Route" && (
                    <button
                      onClick={() => handleUpdateStatus(m.id, "Completed")}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      ✅ Mark Completed
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity Feed */}
      <section className="max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">📡 Recent Updates</h3>
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

export default Rescue;
