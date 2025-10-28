import Navbar from '../components/shared/Navbar';
import CampusMap from '../components/map/CampusMap';

const MapPage = () => {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-100 overflow-hidden">
      <Navbar />
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <CampusMap />
      </div>
    </div>
  );
};

export default MapPage;