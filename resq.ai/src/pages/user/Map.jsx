import React, { useState } from 'react';
import { BsMap, BsWater, BsGeoAlt, BsInfoCircle, BsArrowsFullscreen, BsLayers } from 'react-icons/bs';

export default function Reports() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BsMap className="text-teal-600 text-2xl" />
                <h1 className="text-2xl font-bold text-gray-800">Disaster Analysis</h1>
              </div>
              <p className="text-gray-600">Real-time satellite imagery and disaster monitoring</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                <BsGeoAlt className="mr-2" /> Current Location
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <BsArrowsFullscreen className="mr-2" /> {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          {/* Controls Bar */}
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <BsLayers /> Layers
              </button>
              <button 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowInfo(!showInfo)}
              >
                <BsInfoCircle /> {showInfo ? 'Hide Info' : 'Show Info'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BsWater className="text-blue-500" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Map Container */}
          <div className="relative">
            {/* Existing iframe */}
            <div className="relative" style={{ height: isFullscreen ? '100vh' : '800px' }}>
              <iframe 
                src="https://fastflood.org/"
                className="w-full h-full border-none"
                title="Flood Prediction Tool"
                loading="lazy"
              />
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
}

