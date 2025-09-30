import { createContext, useState, useEffect } from "react";
import axios from 'axios';

export const SOSContext = createContext();

export function SOSProvider({ children }) {
  const API_URL = 'http://localhost:5000/api';
  // Load saved data from localStorage on init
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem("sos_requests");
    return saved ? JSON.parse(saved) : [];
  });

  const [missions, setMissions] = useState(() => {
    const saved = localStorage.getItem("sos_missions");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever requests or missions change
  useEffect(() => {
    localStorage.setItem("sos_requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("sos_missions", JSON.stringify(missions));
  }, [missions]);

  // Citizen sends SOS -> backend incident
  const sendSOS = async (sosData) => {
    const { title, description, reporter, location, priority } = sosData;
    const res = await axios.post(`${API_URL}/incidents`, {
      title, description, reporter, location, priority
    }, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const incident = res.data.data.incident;
    setRequests((prev) => [...prev, { ...sosData, id: incident._id }]);
    return incident;
  };

  // Rescue accepts SOS
  const acceptMission = (sosId, team) => {
    const sos = requests.find((r) => r.id === sosId);
    if (!sos) return;
    setRequests((prev) => prev.filter((r) => r.id !== sosId));
    setMissions((prev) => [...prev, { ...sos, acceptedBy: team, status: "Accepted" }]);
  };

  // Admin/Rescue updates mission status
  const updateMissionStatus = (missionId, newStatus) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, status: newStatus } : m
      )
    );
  };

  return (
    <SOSContext.Provider
      value={{ requests, missions, sendSOS, acceptMission, updateMissionStatus }}
    >
      {children}
    </SOSContext.Provider>
  );
}
