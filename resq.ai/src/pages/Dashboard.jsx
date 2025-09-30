import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import axios from "axios";

import ReportModal from "../components/ReportModal";
import RequestJoinTeam from "../components/RequestJoinTeam";

const API_URL = "http://localhost:5000/api";

export default function DisasterDashboard() {
  const [activeTab, setActiveTab] = useState("alerts");
  const [weather, setWeather] = useState(null);
  const [riskLevel, setRiskLevel] = useState("Low");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isJoinTeamModalOpen, setIsJoinTeamModalOpen] = useState(false);

  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Fetch weather using supplied coordinates
  const fetchWeatherFromServer = async (lat, lon) => {
    if (lat == null || lon == null) return;

    try {
      setLoading(true);
      setError(null);

      const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${base}/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch weather");
      }

      setWeather(data);
      setRiskLevel(data.risk || "Low");
      console.log("🌤 Weather fetched:", data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError(err.message);
      setWeather(null);
      setRiskLevel("Low");
    } finally {
      setLoading(false);
    }
  };

  // Submit report
  const handleReportSubmit = async (reportData) => {
    try {
      await axios.post(`${API_URL}/reports`, reportData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      showToast("Report submitted successfully", "success");
      setIsReportModalOpen(false);
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || "Failed to submit report", "error");
    }
  };

  // Get user coordinates on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          fetchWeatherFromServer(latitude, longitude);
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
          const fallback = { lat: 20.2961, lon: 85.8245 }; // fallback: Bhubaneswar
          setCoordinates(fallback);
          fetchWeatherFromServer(fallback.lat, fallback.lon);
        }
      );
    } else {
      const fallback = { lat: 20.2961, lon: 85.8245 };
      setCoordinates(fallback);
      fetchWeatherFromServer(fallback.lat, fallback.lon);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Disaster Dashboard</h1>
        </div>

        {/* Show coordinates */}
        {coordinates.lat != null && coordinates.lon != null && (
          <p className="text-gray-300 mb-4">
            🌍 Your Coordinates: Latitude {coordinates.lat.toFixed(4)}, Longitude{" "}
            {coordinates.lon.toFixed(4)}
          </p>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-4">
            {loading && <p className="text-gray-400">Fetching live weather data...</p>}
            {error && <p className="text-red-400">⚠ Error: {error}</p>}
            {!loading && weather && (
              <div className="bg-gray-800 p-4 rounded-xl">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Live Weather Alert
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-white">
                    🌡 {weather.main}: {weather.description}, {weather.temperature}°C
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      riskLevel === "High"
                        ? "bg-red-600 text-white"
                        : riskLevel === "Medium"
                        ? "bg-yellow-500 text-black"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {riskLevel} Risk
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {isReportModalOpen && (
          <ReportModal
            onClose={() => setIsReportModalOpen(false)}
            onSubmit={handleReportSubmit}
          />
        )}
        {isJoinTeamModalOpen && (
          <RequestJoinTeam onClose={() => setIsJoinTeamModalOpen(false)} />
        )}
      </div>
    </div>
  );
}
