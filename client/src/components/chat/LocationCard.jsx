import { useState } from 'react';

export default function LocationCard({ message }) {
  const [imageError, setImageError] = useState(false);

  // Extract building info from function calls
  const buildingData = message.functionCalls?.find(call =>
    call.name === 'queryDatabase' && call.args.queryType === 'building'
  )?.response?.results?.[0];

  if (!buildingData) {
    return null;
  }

  const handleNavigate = () => {
    // TODO: Implement navigation to map with this building
    console.log('Navigate to:', buildingData.name);
  };

  return (
    <div className="flex flex-col w-full max-w-md rounded-xl bg-white overflow-hidden shadow-sm border border-slate-200">
      {/* Building Image */}
      <div className="relative w-full h-48 bg-slate-200">
        {!imageError ? (
          <img
            src={buildingData.photoURL}
            alt={buildingData.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <span className="text-4xl">🏢</span>
          </div>
        )}

        {/* Building Icon Overlay */}
        <div className="absolute top-3 right-3">
          <span className="text-2xl">🏛️</span>
        </div>
      </div>

      {/* Building Info */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {buildingData.name}
          </h3>
          <p className="text-sm text-slate-600">
            {buildingData.department || 'University Building'}
          </p>
          {buildingData.description && (
            <p className="text-sm text-slate-500 mt-2">
              {buildingData.description}
            </p>
          )}
        </div>

        {/* Navigate Button */}
        <button
          onClick={handleNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-lg h-11 px-4 text-white text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          <span className="material-symbols-outlined text-xl">navigation</span>
          Take Me There
        </button>
      </div>
    </div>
  );
}