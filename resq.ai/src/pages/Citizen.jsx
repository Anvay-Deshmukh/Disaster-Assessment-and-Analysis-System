import { useState, useContext, useEffect } from "react";
import { SOSContext } from "../context/SOSContext";
import { useToast } from "../context/ToastContext";
import axios from 'axios';

function Citizen() {
  const { sendSOS } = useContext(SOSContext);
  const { showToast } = useToast();
  const API_URL = 'http://localhost:5000/api';

  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [emergencyType, setEmergencyType] = useState("Flood");
  const [lastSOS, setLastSOS] = useState(null);
  const [loading, setLoading] = useState(false);

  const [lastIncidentId, setLastIncidentId] = useState(null);

  useEffect(() => {
    let timer;
    if (lastIncidentId) {
      const poll = async () => {
        try {
          const res = await axios.get(`${API_URL}/incidents/${lastIncidentId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const inc = res.data?.data?.incident;
          if (inc?.status === 'accepted') {
            const leader = inc.acceptedBy?.leader?.name || 'Team Leader';
            showToast(`Help is on the way! Team: ${inc.acceptedBy?.name}, Leader: ${leader}. ETA: ${inc.etaMinutes || 'N/A'} min`, 'success');
            clearInterval(timer);
          } else if (inc?.status === 'cancelled') {
            showToast('No help is reaching as ResQ.AI has cancelled help.', 'error');
            clearInterval(timer);
          } else if (inc?.status === 'assigned' && !inc.acceptedBy) {
            // continue polling
          }
        } catch (e) {
          // ignore transient errors
        }
      };
      timer = setInterval(poll, 5000);
    }
    return () => timer && clearInterval(timer);
  }, [lastIncidentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!navigator.geolocation) {
      alert("❌ Geolocation not supported.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const sosData = {
          title: emergencyType,
          description: message,
          reporter: { phone: contact },
          location: {
            coordinates: {
              type: 'Point',
              coordinates: [pos.coords.longitude, pos.coords.latitude]
            }
          },
          priority: 'high'
        };

        try {
          const incident = await sendSOS(sosData); // POST to backend
          setLastSOS({
            emergencyType,
            location: `${pos.coords.latitude}, ${pos.coords.longitude}`,
            message,
            contact,
            time: new Date().toLocaleString(),
          });
          setLastIncidentId(incident._id);
          showToast('SOS sent successfully!', 'success');
        } catch (err) {
          showToast('Failed to send SOS', 'error');
        }

        setMessage("");
        setContact("");
        setEmergencyType("Flood");
        setLoading(false);

      },
      () => {
        showToast("Could not fetch location. Please enable GPS.", 'error');
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-red-400">🚨 Citizen SOS Request</h2>
        <p className="mt-2 text-gray-300 max-w-2xl mx-auto">
          Just fill in details, your location will be fetched automatically, and rescuers will be notified.
        </p>
      </section>

      {/* SOS Form */}
      <section className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-teal-400 mb-4">Emergency Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={emergencyType}
            onChange={(e) => setEmergencyType(e.target.value)}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
          >
            <option>Flood</option>
            <option>Earthquake</option>
            <option>Cyclone</option>
            <option>Fire</option>
            <option>Medical Emergency</option>
          </select>

          <textarea
            placeholder="Describe your emergency"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
            rows={4}
            required
          />

          <input
            type="text"
            placeholder="Your contact number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow font-semibold w-full"
          >
            {loading ? "⏳ Sending..." : "🚨 Send SOS"}
          </button>
        </form>
      </section>

      {/* Last SOS */}
      {lastSOS && (
        <section className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-yellow-400">📡 Last SOS Sent</h3>
          <ul className="mt-3 text-gray-300 space-y-1">
            <li><strong className="text-teal-400">Type:</strong> {lastSOS.emergencyType}</li>
            <li><strong className="text-teal-400">Location:</strong> {lastSOS.location}</li>
            <li><strong className="text-teal-400">Message:</strong> {lastSOS.message}</li>
            <li><strong className="text-teal-400">Contact:</strong> {lastSOS.contact}</li>
            <li><strong className="text-teal-400">Time:</strong> {lastSOS.time}</li>
          </ul>
        </section>
      )}
    </div>
  );
}

export default Citizen;
