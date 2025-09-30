import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, MapPin, FileText, Clock } from "lucide-react";

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const disasterTypes = [
    { id: 'flood', name: 'Flood' },
    { id: 'earthquake', name: 'Earthquake' },
    { id: 'cyclone', name: 'Cyclone' },
    { id: 'landslide', name: 'Landslide' },
    { id: 'tsunami', name: 'Tsunami' },
    { id: 'drought', name: 'Drought' },
    { id: 'wildfire', name: 'Wildfire' },
    { id: 'industrial_accident', name: 'Industrial Accident' },
    { id: 'chemical_leak', name: 'Chemical Leak' },
    { id: 'building_collapse', name: 'Building Collapse' },
    { id: 'transport_accident', name: 'Transport Accident' },
    { id: 'terrorist_attack', name: 'Terrorist Attack' },
    { id: 'civil_unrest', name: 'Civil Unrest' },
    { id: 'other', name: 'Other' },
  ];

  const [formData, setFormData] = useState({
    disasterType: "",
    disasterSubType: "",
    location: "",
    pincode: "",
    description: "",
    urgency: "medium",
    peopleAffected: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl bg-gray-900 p-6 shadow-2xl border border-gray-700"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Report Disaster
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Disaster Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">
                    Disaster Category
                  </label>
                  <select
                    name="disasterType"
                    value={formData.disasterType}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="natural">Natural Disaster</option>
                    <option value="manmade">Man-made Disaster</option>
                    <option value="accident">Accident</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">
                    Disaster Type
                  </label>
                  <select
                    name="disasterSubType"
                    value={formData.disasterSubType}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    required
                  >
                    <option value="">Select type</option>
                    {formData.disasterType === 'natural' && (
                      <>
                        <option value="flood">Flood</option>
                        <option value="earthquake">Earthquake</option>
                        <option value="cyclone">Cyclone</option>
                        <option value="landslide">Landslide</option>
                        <option value="tsunami">Tsunami</option>
                        <option value="drought">Drought</option>
                        <option value="wildfire">Wildfire</option>
                      </>
                    )}
                    {formData.disasterType === 'manmade' && (
                      <>
                        <option value="industrial_accident">Industrial Accident</option>
                        <option value="chemical_leak">Chemical Leak</option>
                        <option value="building_collapse">Building Collapse</option>
                        <option value="transport_accident">Transport Accident</option>
                        <option value="terrorist_attack">Terrorist Attack</option>
                        <option value="civil_unrest">Civil Unrest</option>
                      </>
                    )}
                    {formData.disasterType === 'accident' && (
                      <>
                        <option value="road_accident">Road Accident</option>
                        <option value="fire_accident">Fire Accident</option>
                        <option value="building_collapse">Building Collapse</option>
                        <option value="industrial_accident">Industrial Accident</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Area, Landmark..."
                      className="w-full pl-9 rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    pattern="\d{6}"
                    maxLength="6"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    required
                  />
                </div>
              </div>

              {/* Description & People Affected */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">
                    Number of People Affected (Approx.)
                  </label>
                  <input
                    type="number"
                    name="peopleAffected"
                    value={formData.peopleAffected}
                    onChange={handleChange}
                    min="1"
                    placeholder="Enter approximate number"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide detailed information about the situation, including any immediate dangers, access routes, and specific assistance needed..."
                    rows="4"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    required
                  />
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Urgency Level
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition"
              >
                Submit Report
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
