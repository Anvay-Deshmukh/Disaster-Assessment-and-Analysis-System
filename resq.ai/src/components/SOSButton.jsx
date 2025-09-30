import { useState, useContext } from "react";
import { SOSContext } from "../context/SOSContext";
import { useToast } from "../context/ToastContext";
import { AlertTriangle } from "lucide-react"; // nice SOS icon

function SOSButton() {
  const { sendSOS } = useContext(SOSContext);
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleSOS = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const sosData = {
          title: "Emergency Report",
          description: `Quick SOS from ${name}`,
          reporter: { name, phone: contact },
          location: {
            coordinates: {
              type: "Point",
              coordinates: [position.coords.longitude, position.coords.latitude],
            },
          },
          priority: "high",
        };

        try {
          await sendSOS(sosData);
          showToast("SOS sent successfully!", "success");
        } catch (err) {
          console.error(err);
          showToast("Failed to send SOS", "error");
        }

        setName("");
        setContact("");
        setLoading(false);
      },
      () => {
        showToast("Could not get location. Please allow location access.", "error");
        setLoading(false);
      }
    );
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Small Floating Icon */}
      {!hovered && (
        <div className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg cursor-pointer flex items-center justify-center">
          <AlertTriangle size={28} />
        </div>
      )}

      {/* Expanded SOS Form */}
      {hovered && (
        <form
          onSubmit={handleSOS}
          className="bg-gray-800 p-4 rounded-xl shadow-lg space-y-3 w-72 transition-all duration-300"
        >
          <h2 className="text-xl font-bold text-red-400 text-center">🚨 Quick SOS</h2>

          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
          />

          <input
            type="text"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="bg-gray-900 text-gray-200 border border-gray-600 p-2 w-full rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg w-full font-semibold"
          >
            {loading ? "⏳ Sending..." : "🚨 Send SOS"}
          </button>
        </form>
      )}
    </div>
  );
}

export default SOSButton;
