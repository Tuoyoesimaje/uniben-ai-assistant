import { useState, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Search, Filter, Building2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import useSidebarToggle, { TOP_NAV_HEIGHT } from '../../hooks/useSidebarToggle';

// Mapbox API functions
const searchLocation = async (query, proximity) => {
  // Add "University of Benin" to search query for better results
  const enhancedQuery = query.includes('UNIBEN') || query.includes('University') ? query : `${query} University of Benin`;

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(enhancedQuery)}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}&proximity=${proximity}&limit=5`
  );
  const data = await response.json();
  return data.features || [];
};

const getDirections = async (startLng, startLat, endLng, endLat) => {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${startLng},${startLat};${endLng},${endLat}?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}&geometries=geojson&steps=true`
  );
  const data = await response.json();
  return data.routes ? data.routes[0] : null;
};

// Icon mapping function from the navigation system
const getIconForBuilding = (iconType) => {
  const iconMap = {
    'GATE': '🚪',
    'ADMIN': '🏛️',
    'LIBRARY': '📚',
    'AUDITORIUM': '🎭',
    'ENGINEERING': '⚙️',
    'ARTS': '🎨',
    'SOCIAL': '👥',
    'LAW': '⚖️',
    'SPORTS': '⚽',
    'HOSPITAL': '🏥',
    'COMPUTER': '💻',
    'SCIENCE': '🔬',
    'BIOLOGY': '🧬',
    'EDUCATION': '📖',
    'LECTURE': '🎭',
    'THEATRE': '🏛️',
    'HOSTEL_M': '🏠',
    'HOSTEL_F': '🏠',
    'CAFETERIA': '🍽️'
  };
  return iconMap[iconType] || '🏢';
};

const CampusMap = () => {
  const mapRef = useRef();
  const [viewState, setViewState] = useState({
    longitude: 5.609032, // UNIBEN Main Gate coordinates
    latitude: 6.399885,
    zoom: 16
  });

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [searchedLocations, setSearchedLocations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startPoint, setStartPoint] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  // Sidebar control (desktop open by default, mobile closed)
  const { isOpen: isSidebarOpen, isMobile, toggle, setOpen } = useSidebarToggle();

  // When sidebar toggles, resize the map after the CSS transition so tiles render correctly
  useEffect(() => {
    const resizeMap = () => {
      try {
        const map = mapRef.current && mapRef.current.getMap ? mapRef.current.getMap() : null;
        if (map && typeof map.resize === 'function') map.resize();
      } catch (e) {
        // ignore
      }
    };

    // call after transition (300ms) and also immediately
    resizeMap();
    const t = setTimeout(resizeMap, 320);
    return () => clearTimeout(t);
  }, [isSidebarOpen]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [autoAdvanceInterval, setAutoAdvanceInterval] = useState(null);

  // UNIBEN Main Campus buildings with exact coordinates from provided data
  const buildings = [
    {
      id: 1,
      name: 'Main Campus (Main Gate)',
      type: 'gate',
      category: 'administrative',
      coordinates: '5.609032, 6.399885',
      description: 'Main entrance to UNIBEN Ugbowo Campus',
      emoji: '🚪',
      faculty: 'General',
      icon: 'GATE',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyAfheWxrj0erWwSdSdodUpfwFusHscf2aYTNBHZPkvbN_LQclSyGCD2Z8bnYinj2IUoXmHGIsHmKutjy0ykSmYqyHPE_YWcUuV_IhCx6wXxP6OPBLaob0ON7ihF52QFDFz77c7=w408-h544-k-no'
    },
    {
      id: 2,
      name: 'Uniben Sport Complex',
      type: 'sports',
      category: 'facility',
      coordinates: '5.611795, 6.398232',
      description: 'Football field, basketball courts, and athletic facilities',
      emoji: '⚽',
      faculty: 'General',
      icon: 'SPORTS',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxUhmGI3JV4-wzLZKCsjvGf__OcR-FiOqsyOLc2BexhOgH3gXj7h9MWyaaRIQHVKQyYmnsyTcpA4-fsMNlAANudWLmCgHeCqjINe4G6zudHUDHv2TINtRck7vj-zqGlwoqhA-w8=w408-h306-k-no'
    },
    {
      id: 3,
      name: 'Akin Deko Auditorium',
      type: 'auditorium',
      category: 'academic',
      coordinates: '5.613737, 6.399650',
      description: 'Main lecture hall for large gatherings and university events',
      emoji: '🏛️',
      faculty: 'General',
      icon: 'AUDITORIUM',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxnZkgq88C3Vi_TQVznOrdhSPQNjh3xsqs9HstOXV5XDd0sSdVTft3qvzJcByTI2tBjWuIydsFkv9teHX1qxot3sJ1z9Fv7QUvS-xgvWGnDhnWQV2r-RkKcPGBsWKIvSqrK5lLE=w408-h544-k-no'
    },
    {
      id: 4,
      name: 'Faculty of Sciences',
      type: 'faculty',
      category: 'academic',
      coordinates: '5.615284, 6.399449',
      description: 'Faculty of Physical and Life Sciences',
      emoji: '🔬',
      faculty: 'Sciences',
      icon: 'SCIENCE',
      imageUrl: null
    },
    {
      id: 5,
      name: 'UniBen Faculty of Life Sciences Journals',
      type: 'faculty',
      category: 'academic',
      coordinates: '5.615038, 6.399513',
      description: 'Biology, microbiology, and life science departments',
      emoji: '🧬',
      faculty: 'Life Sciences',
      icon: 'BIOLOGY',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxR3X80xHLidmiVyZ-2qUD91qrHErh7Z1YrXkDxRjhpToCAok-qEVaJ6B4TvQ-PrPUyyrLAwHYYddhI7c-TNmfFsx6zPeMlB07eNj02HQm3qlFwlvRdVJQcm969b1TCXNZTY40n=w408-h306-k-no'
    },
    {
      id: 6,
      name: 'Physics Department',
      type: 'department',
      category: 'academic',
      coordinates: '5.615548, 6.399591',
      description: 'Department of Physics',
      emoji: '⚛️',
      faculty: 'Physical Sciences',
      icon: 'SCIENCE',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwb7ghAkKGS_YhiTHp69nkMaYIzbSQPelCQ7AORxg3f3sdDRYjuW_CIukpZQ6kgaK-OAQPaEy8ARxoYxbNZZvgSgqwqnbEdcixBYbR8J6BiTSyOAHPhvtrLoBCacFQRP7MbT-zQ=w533-h240-k-no'
    },
    {
      id: 7,
      name: 'Department of Optometry/Physics',
      type: 'department',
      category: 'academic',
      coordinates: '5.615970, 6.399442',
      description: 'Optometry and Physics departments',
      emoji: '👁️',
      faculty: 'Physical Sciences',
      icon: 'SCIENCE',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwbe9GWffDnVTSQeOhFgTjeC6549OVfpzCs2yic7Th8ftiXkYAtVvenma_bZ9_3dcEudQT5E0pzjSnNZphmoRfCSs8xf6NmDW-Id4N8yCbhjZkQE-75wJxauSYnGux5x_M3Nyh2=w408-h725-k-no'
    },
    {
      id: 8,
      name: 'Department of Chemistry',
      type: 'department',
      category: 'academic',
      coordinates: '5.615485, 6.398909',
      description: 'Department of Chemistry',
      emoji: '🧪',
      faculty: 'Physical Sciences',
      icon: 'SCIENCE',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxmhsB21SIvhoqvYYBquCZUaVU8yZU9YsUhiFxjiMQzEifohYYF-rCE-NNatR3OyXcHvUM8a8ScWRGGTt4yWkzDbUpyMLxJVWQj_tcIAubX8x2DLXS-RlM233fS0s_3-RVv_gk=w408-h544-k-no'
    },
    {
      id: 9,
      name: 'Department of Botany',
      type: 'department',
      category: 'academic',
      coordinates: '5.615182, 6.398260',
      description: 'Department of Botany and Plant Sciences',
      emoji: '🌱',
      faculty: 'Life Sciences',
      icon: 'BIOLOGY',
      imageUrl: null
    },
    {
      id: 10,
      name: 'Bursary department, UNIBEN',
      type: 'administrative',
      category: 'administrative',
      coordinates: '5.614681, 6.397492',
      description: 'Financial services and student payments',
      emoji: '💰',
      faculty: 'General',
      icon: 'ADMIN',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxv5shoSbnsUvkns0fOr1zCqFpkThl5PBr7R-moyu_JNkDrTFFFy06YgoTXeO4QmQpdEminXKAaBa8QxqmAXvfsA52KXn6YCozkznfQkTbNWBR3SxuWEfFFpB3sS0rwUX_4U9r9=w408-h544-k-no'
    },
    {
      id: 11,
      name: 'Library extension',
      type: 'library',
      category: 'facility',
      coordinates: '5.616326, 6.396673',
      description: 'University library extension',
      emoji: '📚',
      faculty: 'General',
      icon: 'LIBRARY',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyl-qTpPaq-2DpS298j7BQJfWnZ4eVajpIkxVe9YVakk8N8x_xFMVhaZyWevRz3ow4hik910UrrFCbbRIe6y-VgLHtKdZp0qsVIU9myQujKFSGWMW8GeaxBuRLY2OeHtCGo_hZVVA=w408-h725-k-no'
    },
    {
      id: 12,
      name: 'Environmental Management And Toxicology Department',
      type: 'department',
      category: 'academic',
      coordinates: '5.615996, 6.397834',
      description: 'Environmental management and toxicology studies',
      emoji: '🌍',
      faculty: 'Life Sciences',
      icon: 'BIOLOGY',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyGqOAGZvsx0oeTt7PEdDIqGig-CLqgsc9wjjUJnSJOCvZKkDhJ5RwQj7xfcIKtepyXv9SN4Rcw2hS4Zp80eUlKO86ed6mUB8mJA_QZB9_oYEmYZEjaRaGam0jfP_gqnFapYJ-b=w426-h240-k-no'
    },
    {
      id: 13,
      name: 'FESTUS IYAYI HALL',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.617712, 6.398526',
      description: 'Student hostel accommodation',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_M',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxMr1d_rKWo4HE-DQ_cKw1xQ9pHOF09YtNjtuyhUemEGIIceAKwME_fh_XcaCGSmAmIUosAJDnooscEKWCeJLGvzBV5Oi58j_vROi5axW5muM_YRmEs3lkYbFyxsNaqSX3oiPIS=w408-h544-k-no'
    },
    {
      id: 14,
      name: 'Professor Iyayi Hall',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.618784, 6.398973',
      description: 'Student hostel accommodation',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_M',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSygc5pA1jtAGYYB-IP71G19Jpbx2AOS3qY3eJa0tjrhZPh6SWeUqSWZfysNj0WeULIfZ4lsOLxI6q3-1iS8KQvGB4SQrCMvgZcjY6PLYSaLfX3tkTm8uqqQWBI4SfBeor9RyikG=w408-h544-k-no'
    },
    {
      id: 15,
      name: 'Hall 1 (Queen Idia Hostel)',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.619116, 6.396723',
      description: 'Female student hostel',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_F',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxMDvf20jGBztdKPO5izym9VN-TsTQh9L7dpAG2A3UK9IrBDIuiTLB008CUEMcP2W7lrkplnBan6El3N_kNGoXKXwjj2qa_UKKO0I4-VXFaa49HVwFGTfbBTMHuIvdiw6mTCjWg=w408-h305-k-no'
    },
    {
      id: 16,
      name: 'Hall 2 (Tinubu Female Hostel) UNIBEN',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.620193, 6.398508',
      description: 'Female student hostel',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_F',
      imageUrl: null
    },
    {
      id: 17,
      name: 'Hall 4 Unit 2',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.622978, 6.397628',
      description: 'Student hostel accommodation',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_M',
      imageUrl: 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=BMAE_LMhlAQY0AK2kYyq4g&cb_client=search.gws-prod.gps&w=408&h=240&yaw=93.37706&pitch=0&thumbfov=100'
    },
    {
      id: 18,
      name: 'UNIBEN Hall 4 (Akanu Ibiam) Hostel Unit 2',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.623666, 6.398380',
      description: 'Student hostel accommodation',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_M',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyRGyYudgw717NjPaVhabWA0KwoezZqngII1O_njbOncOwsn5u1KtullHTJObgyd388SrV2krCLD0PNSn156XERQixIZ4hYb2hs7HFkX_ATBGkORpeMT6ZLlbVHgLYI-QHTmU4h=w426-h240-k-no'
    },
    {
      id: 19,
      name: 'Keystone Hostel',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.624343, 6.399109',
      description: 'Private student hostel',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_M',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSx0e-9dC9_YACRyCYGaI2Xqcrd_9dUGLkVzhlAzDVE7St8QtcVenRnrd2yrmGUF7jWhpGCz2r-1W4vRl-VCXJ0k8duSSKyaI_Sh1ppItoBAhxOjIW36Gu42Dwn1wIaYcPrGYOmeOA=w426-h240-k-no'
    },
    {
      id: 20,
      name: 'Faculty of Engineering',
      type: 'faculty',
      category: 'academic',
      coordinates: '5.615267, 6.401964',
      description: 'Engineering departments and workshops',
      emoji: '⚙️',
      faculty: 'Engineering',
      icon: 'ENGINEERING',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSx-1cGuoL6ubwy7TjcS61-_n-lhnGL80AlBfi2ZlYaSR9jBQcNuK3enbibfT0CYblnOfmEQTmqdOyCl1FzVcsB2JLUvGj1BTeklsEriqB1izvuu0een8QLGA0QvB3MPFKFpwWv3=w408-h306-k-no'
    },
    {
      id: 21,
      name: 'Uniben International ICT centre',
      type: 'ict center',
      category: 'facility',
      coordinates: '5.616583, 6.400991',
      description: 'International ICT center and computer facilities',
      emoji: '💻',
      faculty: 'General',
      icon: 'COMPUTER',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSx68YSx8NVp9dknHgie9pDwmclLhPT-nC6V5Kipzw-JdGHW1SLhuMH7TCB3cUnR-4TTjxy_F_4A4_aah3RrBwQiVU3ugRlAe6jIuXzuk8mAt56u4BUd0PwiRUuKzbe7QjaGJ5Y=w408-h544-k-no'
    },
    {
      id: 22,
      name: 'Computer Science Department, Uniben',
      type: 'department',
      category: 'academic',
      coordinates: '5.617819, 6.400840',
      description: 'Department of Computer Science',
      emoji: '💻',
      faculty: 'Physical Sciences',
      icon: 'COMPUTER',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxxmYDXzZBapsnCjEcyDUifyWZAQZz-_lVe_TrjFJ-_FABeTF_6WO1Y3sLPECa2WlwdF8L5qZyglruP5wED3p1H-CnCXHwTi8zLm7ClVIclooYzikFsMbvUIuG_Z4NzqVktuHM=w408-h544-k-no'
    },
    {
      id: 23,
      name: 'Department of Materials and Metallurgy Engineering, Faculty of Engineering.',
      type: 'department',
      category: 'academic',
      coordinates: '5.617955, 6.401850',
      description: 'Materials and Metallurgy Engineering',
      emoji: '⚒️',
      faculty: 'Engineering',
      icon: 'ENGINEERING',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSzc1fTRGcuegwlHziyy5e_buAc2f2toiuw_o99GCNSlv917z1Ng7BtL_7ViraNWAnXlCezYK17YRQKkmZTaoVEEAjQKyOzdle_-9_yxT1q3fBOWVODUTFtl2G30dtkYzgH54s-z=w408-h298-k-no'
    },
    {
      id: 24,
      name: 'Electrical/Electronics Department',
      type: 'department',
      category: 'academic',
      coordinates: '5.614495, 6.402679',
      description: 'Electrical and Electronics Engineering',
      emoji: '⚡',
      faculty: 'Engineering',
      icon: 'ENGINEERING',
      imageUrl: null
    },
    {
      id: 25,
      name: 'Department of Civil Engineering Laboratory',
      type: 'department',
      category: 'academic',
      coordinates: '5.616217, 6.403598',
      description: 'Civil Engineering labs and facilities',
      emoji: '🏗️',
      faculty: 'Engineering',
      icon: 'ENGINEERING',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxuhseBr1Nh1pfv6CFHtQvtbBnR7PvREYUBIXzzPA6sU0LesHifHTJPGHCy9KjgXasjDS4okMDobifgUAWL_CaFXOqo6W4nDuGngAYe4wQVLLI6TmgFUmYgry-RjBBAWQUQePfN8g=w408-h306-k-no'
    },
    {
      id: 26,
      name: 'Department of Petroleum Engineering, University Of Benin',
      type: 'department',
      category: 'academic',
      coordinates: '5.618157, 6.402589',
      description: 'Petroleum Engineering department',
      emoji: '🛢️',
      faculty: 'Engineering',
      icon: 'ENGINEERING',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSw-dGclQS7kJz_Lnm6nhBEFqvgap7_gOkvvnARrYv-Xd6v5sVIM_LY02cpUNZoDR2ZfpC4d4qNSpsmMh_WMm1839X_oL1S-d044IfeyYSwPcUGT1dVq2bsfHksRZ2Os1s1DEMTYgQ=w408-h306-k-no'
    },
    {
      id: 27,
      name: 'MTN B-Net Library',
      type: 'library',
      category: 'facility',
      coordinates: '5.616832, 6.396419',
      description: 'MTN sponsored digital library',
      emoji: '📚',
      faculty: 'General',
      icon: 'LIBRARY',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSz-sPDnp2Oc4ZF4Xxcr4OXp8QEinqUoFqxYPfrsoFilZE9jjwOBBGCUYFFn27AhyYiSIYDx6qsShP4KBAxYI6U5k6E7qQtLQnCbicP6Y1y-DZgH6S6lgVRwp_fRx1pPTEpAKUng=w408-h306-k-no'
    },
    {
      id: 28,
      name: 'Maingate Shopping Complex Uniben',
      type: 'commercial',
      category: 'facility',
      coordinates: '5.610023, 6.398362',
      description: 'Shopping complex near main gate',
      emoji: '🛒',
      faculty: 'General',
      icon: 'ADMIN',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSzuDnwWtyxqmTYI2N8PbvDk9Ulb_5qRfyUr3s4KtRRuraH1r7kLtqp3ipLRCTAS-8UHK9DB4dH3uvoCj1qJ8c2q-WOK8-AYBY0UlmqWd7oIrZ-aXcHta6bOw9xTQEmJ3tB_1Kch=w408-h306-k-no'
    },
    {
      id: 29,
      name: 'Faculty of Pharmacy, UNIBEN',
      type: 'faculty',
      category: 'academic',
      coordinates: '5.621045, 6.394406',
      description: 'Faculty of Pharmacy and Pharmaceutical Sciences',
      emoji: '💊',
      faculty: 'Pharmacy',
      icon: 'SCIENCE',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSzaHJr4TybUZYqgUKDDie_3PUTNyTcEpz51NMxaiPYrfWM_UXdoxj9vhxwhf_mjSnyklvcVO7nNuznTgiEp7KoQRfeNDyPbMpX3B9LuBckqQlcI8-sR6i5q4QggaVNcevgz4aSs=w408-h306-k-no'
    },
    {
      id: 30,
      name: 'Tetfund Hostel',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.628061, 6.399221',
      description: 'Tetfund sponsored student hostel',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_M',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyJMjeeN6HD_LnYSRp8gM9Ws9sFX3ELVF0s0tYN09YLf-Z7XrQfwZpGBVQeAw6wu5UOSj7OcKq5z1Thjee_YuQk81lTsreGUCk_IUYYqFBAABiBZULob7dBqZpntsJET3SFFwbX=w408-h320-k-no'
    },
    {
      id: 31,
      name: 'NDDC Hostel, UNIBEN',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.617260, 6.395460',
      description: 'NDDC sponsored student hostel',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_M',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxUI-pj1qbrwu4ztidtE2Isxyp_AwEGid9kjQtFMsBE0Fqh7Or2rqU91GNfgU_IYWgEFnk2py0FbNv4Ql_bY9eacnr9VVUjOrMKz7c2ZYDEziMYs6juOdM52AvCEpvzWVXC9PS1=w426-h240-k-no'
    },
    {
      id: 32,
      name: 'School of Basic Medical Sciences, University of Benin',
      type: 'school',
      category: 'academic',
      coordinates: '5.624770, 6.394383',
      description: 'Basic medical sciences education',
      emoji: '🏥',
      faculty: 'Medical Sciences',
      icon: 'HOSPITAL',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxEzKqIooTYrGhJTOFMEu2v-ezEOMbIEcZQLuGaBIRoNEqsEnLST1oxcEpF6WmeViBHGeV15ORuGvMTzOlo1ZPp-yb9jkyAk0WAiWbTrhs1tcx67hd6KJtI3_G4Iwwb0LfVDCLa=w408-h306-k-no'
    },
    {
      id: 33,
      name: 'Department Of Medicine and Surgery',
      type: 'department',
      category: 'academic',
      coordinates: '5.620982, 6.396089',
      description: 'Medicine and Surgery department',
      emoji: '🩺',
      faculty: 'Medical Sciences',
      icon: 'HOSPITAL',
      imageUrl: null
    },
    {
      id: 34,
      name: 'Second Campus (Ekehuan Campus)',
      type: 'gate',
      category: 'administrative',
      coordinates: '5.599760, 6.332565',
      description: 'Main entrance to UNIBEN Ekehuan Campus',
      emoji: '🚪',
      faculty: 'General',
      icon: 'GATE',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSz8PZFqBqq2Y8jqLE5Qj-Li3UT1n1rmm2kzeO196Jvysc4Mvl5DTIKGaIsERpoYbdGHTJNddC1Xtw2_N141FQNrvWWGpzqvcOpz4wjQXa5cIApd_8LZDJYjUwj5ONE7xTD22dc0rg=w425-h240-k-no'
    },
    {
      id: 35,
      name: 'Sub Library University Of Benin',
      type: 'library',
      category: 'facility',
      coordinates: '5.598768, 6.333851',
      description: 'Sub library for university resources',
      emoji: '📚',
      faculty: 'General',
      icon: 'LIBRARY',
      imageUrl: null
    },
    {
      id: 36,
      name: 'Mass Comm Radio Broadcasting Studio',
      type: 'department',
      category: 'academic',
      coordinates: '5.599573, 6.335596',
      description: 'Mass Communication radio broadcasting studio',
      emoji: '📻',
      faculty: 'Social Sciences',
      icon: 'ARTS',
      imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyt0lRIN8JBPjP486uTHd-ITSNhjEZhS4kMlsVW4ft6gz9yxngEe8hEf_1Gb7W3ivN4HrwMV_RNTj7J2RVaXr37W6bi1tHORmBrCuHP4con-2A1TVW27pkS0xq-tw4xCg4IrQ4K_g=w408-h306-k-no'
    },
    {
      id: 37,
      name: 'Female Hostel',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.600639, 6.335271',
      description: 'Female student hostel at Ekehuan Campus',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_F',
      imageUrl: 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=pkE3Mzi6qi6CG5Bn8a68Cg&cb_client=search.gws-prod.gps&w=408&h=240&yaw=103.875824&pitch=0&thumbfov=100'
    },
    {
      id: 38,
      name: 'Department of Mass Communication',
      type: 'department',
      category: 'academic',
      coordinates: '5.598756, 6.335347',
      description: 'Department of Mass Communication studies',
      emoji: '📺',
      faculty: 'Social Sciences',
      icon: 'ARTS',
      imageUrl: null
    },
    {
      id: 39,
      name: 'Department of Fine & Applied Art',
      type: 'department',
      category: 'academic',
      coordinates: '5.602606, 6.333931',
      description: 'Department of Fine and Applied Arts',
      emoji: '🎨',
      faculty: 'Arts',
      icon: 'ARTS',
      imageUrl: null
    },
    {
      id: 40,
      name: 'Department of Education',
      type: 'department',
      category: 'academic',
      coordinates: '5.603144, 6.333770',
      description: 'Department of Education studies',
      emoji: '📖',
      faculty: 'Education',
      icon: 'EDUCATION',
      imageUrl: null
    },
    {
      id: 41,
      name: 'Department Of Fine And Applied Arts',
      type: 'department',
      category: 'academic',
      coordinates: '5.601851, 6.333900',
      description: 'Department of Fine and Applied Arts',
      emoji: '🎨',
      faculty: 'Arts',
      icon: 'ARTS',
      imageUrl: 'https://lh3.googleusercontent.com/pQHYE41uSHfcsym5PO53ST0GsFRXsryy6whJKeSKbxhLqncnXiS8XqX4fYSgbiZy=w426-h240-k-no'
    },
    {
      id: 42,
      name: 'Uniben Ekehuan Campus Girl\'s Hostel',
      type: 'hostel',
      category: 'facility',
      coordinates: '5.600493, 6.334611',
      description: 'Girls hostel at Ekehuan Campus',
      emoji: '🏠',
      faculty: 'General',
      icon: 'HOSTEL_F',
      imageUrl: 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=agUSmQ1yvzjY0UIVMuT6Ag&cb_client=search.gws-prod.gps&w=408&h=240&yaw=78.204445&pitch=0&thumbfov=100'
    },
    {
      id: 43,
      name: 'Petroleum Engineering Building',
      type: 'department',
      category: 'academic',
      coordinates: '5.601181, 6.334866',
      description: 'Petroleum Engineering department building',
      emoji: '🛢️',
      faculty: 'Engineering',
      icon: 'ENGINEERING',
      imageUrl: null
    },
    {
      id: 44,
      name: 'Library Annex',
      type: 'library',
      category: 'facility',
      coordinates: '5.598877, 6.334466',
      description: 'Library annex for additional resources',
      emoji: '📚',
      faculty: 'General',
      icon: 'LIBRARY',
      imageUrl: 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=UBAKCWBdeacPvyWdkfSp2Q&cb_client=search.gws-prod.gps&w=408&h=240&yaw=173.10498&pitch=0&thumbfov=100'
    }
  ];

  useEffect(() => {
    let filtered = buildings;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(building => building.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(building =>
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.faculty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBuildings(filtered);
  }, [selectedCategory, searchQuery]);

  // Sidebar responsiveness now handled by useSidebarToggle hook

  // Route visualization effect
  useEffect(() => {
    if (!mapRef.current || !route?.geometry) return;

    const map = mapRef.current.getMap();

    // Remove existing route
    if (map.getSource('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }

    // Add route source and layer
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: route.geometry
      }
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#10B981',
        'line-width': 6,
        'line-opacity': 0.8
      }
    });

    // Cleanup function
    return () => {
      if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }
    };
  }, [route]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (query.trim() === '') {
      setSearchedLocations([]);
      setIsSearching(false);
      return;
    }

    try {
      // Search Mapbox for additional locations with proximity bias to UNIBEN Main Gate
      const proximity = '5.609032,6.399885'; // UNIBEN Main Gate coordinates
      const locations = await searchLocation(query, proximity);

      // Convert Mapbox results to our format
      const mapboxLocations = locations.map(location => ({
        id: `mapbox-${location.id}`,
        name: location.place_name.split(',')[0], // Get just the name
        type: 'searched',
        category: 'searched',
        coordinates: `${location.center[0]}, ${location.center[1]}`,
        description: location.place_name,
        emoji: '📍',
        faculty: 'Searched Location',
        isMapboxResult: true,
        icon: 'LOCATION'
      }));

      setSearchedLocations(mapboxLocations);
    } catch (error) {
      console.error('Search error:', error);
      setSearchedLocations([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
    // Parse coordinates from string format "longitude, latitude"
    const [lng, lat] = building.coordinates.split(', ').map(Number);
    setViewState({
      ...viewState,
      longitude: lng,
      latitude: lat,
      zoom: 18
    });
  };

  const startNavigation = async (building) => {
    const startLocation = startPoint || userLocation;
    if (!startLocation) {
      alert('Please enable location services or set a start point on the map.');
      return;
    }

    setIsNavigating(true);
    setSelectedBuilding(building);
    setCurrentStepIndex(0);

    try {
      // Parse coordinates from string format "longitude, latitude"
      const [endLng, endLat] = building.coordinates.split(', ').map(Number);

      const routeData = await getDirections(
        startLocation.longitude || startLocation.lng,
        startLocation.latitude || startLocation.lat,
        endLng,
        endLat
      );

      if (routeData) {
        setRoute({
          destination: building,
          start: startLocation,
          distance: `${(routeData.distance / 1000).toFixed(1)}km`,
          duration: `${Math.round(routeData.duration / 60)} min`,
          geometry: routeData.geometry,
          steps: routeData.legs[0].steps
        });

        // Start automatic step advancement (every 10 seconds)
        const interval = setInterval(() => {
          setCurrentStepIndex(prevIndex => {
            if (routeData.legs[0].steps && prevIndex < routeData.legs[0].steps.length - 1) {
              return prevIndex + 1;
            } else {
              // Stop auto-advancement when reaching the last step
              clearInterval(interval);
              setAutoAdvanceInterval(null);
              return prevIndex;
            }
          });
        }, 10000); // 10 seconds per step

        setAutoAdvanceInterval(interval);
      } else {
        alert('Could not find a route to this location.');
        setIsNavigating(false);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Failed to get directions. Please try again.');
      setIsNavigating(false);
    }
  };

  const stopNavigation = () => {
    if (autoAdvanceInterval) {
      clearInterval(autoAdvanceInterval);
      setAutoAdvanceInterval(null);
    }
    setIsNavigating(false);
    setRoute(null);
    setShowDirections(false);
    setStartPoint(null);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (route && route.steps && currentStepIndex < route.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      // Reset auto-advance timer when manually navigating
      if (autoAdvanceInterval) {
        clearInterval(autoAdvanceInterval);
        const newInterval = setInterval(() => {
          setCurrentStepIndex(prevIndex => {
            if (route.steps && prevIndex < route.steps.length - 1) {
              return prevIndex + 1;
            } else {
              clearInterval(newInterval);
              setAutoAdvanceInterval(null);
              return prevIndex;
            }
          });
        }, 10000);
        setAutoAdvanceInterval(newInterval);
      }
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      // Reset auto-advance timer when manually navigating
      if (autoAdvanceInterval) {
        clearInterval(autoAdvanceInterval);
        const newInterval = setInterval(() => {
          setCurrentStepIndex(prevIndex => {
            if (route.steps && prevIndex < route.steps.length - 1) {
              return prevIndex + 1;
            } else {
              clearInterval(newInterval);
              setAutoAdvanceInterval(null);
              return prevIndex;
            }
          });
        }, 10000);
        setAutoAdvanceInterval(newInterval);
      }
    }
  };

  const handleMapClick = (event) => {
    if (!isNavigating) {
      const { lng, lat } = event.lngLat;
      setStartPoint({ lng, lat });
    }
  };

  const calculateDistance = (from, to) => {
    // Parse coordinates from string format "longitude, latitude"
    const [lng2, lat2] = to.coordinates.split(', ').map(Number);

    const R = 6371e3; // Earth radius in meters
    const φ1 = from.latitude * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - from.latitude) * Math.PI / 180;
    const Δλ = (lng2 - from.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return Math.round(distance);
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 rounded-2xl overflow-hidden shadow-xl border border-white/20">
      {/* Mobile Backdrop - shows below top nav when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
          style={{ top: `${TOP_NAV_HEIGHT}px` }}
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={toggle}
        className={`fixed bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl ${isMobile ? 'left-4' : ''} ${isMobile ? '' : (isSidebarOpen ? 'left-[304px]' : 'left-2')}`}
        style={{ top: isMobile ? `${TOP_NAV_HEIGHT + 16}px` : '50%', transform: isMobile ? 'none' : 'translateY(-50%)', zIndex: 45, width: isMobile ? 40 : 32, height: isMobile ? 40 : 32 }}
      >
        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        ${isMobile ? 'fixed' : 'relative flex-shrink-0'}
        flex flex-col h-full bg-white border-r z-40 overflow-hidden
        transition-all duration-300 ease-in-out
      `} style={{ top: isMobile ? `${TOP_NAV_HEIGHT}px` : undefined, width: isMobile ? (isSidebarOpen ? '80vw' : '0') : (isSidebarOpen ? '320px' : '0') }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">UNIBEN AI</h1>
                <p className="text-sm text-gray-600">Campus Navigator</p>
              </div>
            </div>
            {/* header close removed - use left-side toggle button per spec */}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for a building..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('academic')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                selectedCategory === 'academic'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setSelectedCategory('administrative')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                selectedCategory === 'administrative'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setSelectedCategory('facility')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                selectedCategory === 'facility'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
              }`}
            >
              Facilities
            </button>
          </div>
        </div>

        {/* Building List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Building Categories */}
          {selectedCategory === 'all' && (
            <>
              {/* Academic Buildings */}
              {filteredBuildings.filter(b => b.category === 'academic').length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-emerald-600 uppercase mb-3 flex items-center gap-2">
                    <Building2 size={16} />
                    Academic Buildings
                  </h3>
                  <div className="space-y-3">
                    {filteredBuildings.filter(b => b.category === 'academic').map((building) => (
                      <div
                        key={building.id}
                        onClick={() => handleBuildingClick(building)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedBuilding?.id === building.id
                            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 shadow-lg'
                            : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg backdrop-blur-sm'
                        }`}
                      >
                        {building.imageUrl && (
                          <img
                            src={building.imageUrl}
                            alt={building.name}
                            className="w-full h-32 object-cover rounded-lg mb-3 shadow-sm"
                          />
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getIconForBuilding(building.icon)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{building.name}</h3>
                            <p className="text-sm text-gray-600 truncate">{building.description}</p>
                            <p className="text-xs text-emerald-600 mt-1 font-medium">{building.faculty}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Administrative Buildings */}
              {filteredBuildings.filter(b => b.category === 'administrative').length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-emerald-600 uppercase mb-3 flex items-center gap-2">
                    <Building2 size={16} />
                    Administrative
                  </h3>
                  <div className="space-y-3">
                    {filteredBuildings.filter(b => b.category === 'administrative').map((building) => (
                      <div
                        key={building.id}
                        onClick={() => handleBuildingClick(building)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedBuilding?.id === building.id
                            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 shadow-lg'
                            : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg backdrop-blur-sm'
                        }`}
                      >
                        {building.imageUrl && (
                          <img
                            src={building.imageUrl}
                            alt={building.name}
                            className="w-full h-32 object-cover rounded-lg mb-3 shadow-sm"
                          />
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getIconForBuilding(building.icon)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{building.name}</h3>
                            <p className="text-sm text-gray-600 truncate">{building.description}</p>
                            <p className="text-xs text-emerald-600 mt-1 font-medium">{building.faculty}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {filteredBuildings.filter(b => b.category === 'facility').length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-purple-600 uppercase mb-3 flex items-center gap-2">
                    <Building2 size={16} />
                    Facilities
                  </h3>
                  <div className="space-y-3">
                    {filteredBuildings.filter(b => b.category === 'facility').map((building) => (
                      <div
                        key={building.id}
                        onClick={() => handleBuildingClick(building)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedBuilding?.id === building.id
                            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 shadow-lg'
                            : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg backdrop-blur-sm'
                        }`}
                      >
                        {building.imageUrl && (
                          <img
                            src={building.imageUrl}
                            alt={building.name}
                            className="w-full h-32 object-cover rounded-lg mb-3 shadow-sm"
                          />
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getIconForBuilding(building.icon)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{building.name}</h3>
                            <p className="text-sm text-gray-600 truncate">{building.description}</p>
                            <p className="text-xs text-emerald-600 mt-1 font-medium">{building.faculty}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Filtered Buildings (when category is selected) */}
          {selectedCategory !== 'all' && (
            <div className="space-y-3">
              {filteredBuildings.map((building) => (
                <div
                  key={building.id}
                  onClick={() => handleBuildingClick(building)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedBuilding?.id === building.id
              ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 shadow-lg'
              : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg backdrop-blur-sm'
                  }`}
                >
                  {building.imageUrl && (
                    <img
                      src={building.imageUrl}
                      alt={building.name}
                      className="w-full h-32 object-cover rounded-lg mb-3 shadow-sm"
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getIconForBuilding(building.icon)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{building.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{building.description}</p>
                      <p className="text-xs text-emerald-600 mt-1 font-medium">{building.faculty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Searched Locations */}
          {searchedLocations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-emerald-600 uppercase mb-3 flex items-center gap-2">
                <Search size={16} />
                Searched Locations
              </h3>
              <div className="space-y-3">
                {searchedLocations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => handleBuildingClick(location)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedBuilding?.id === location.id
                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 shadow-lg'
                        : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg backdrop-blur-sm'
                    }`}
                  >
                    {location.imageUrl && (
                      <img
                        src={location.imageUrl}
                        alt={location.name}
                        className="w-full h-32 object-cover rounded-lg mb-3 shadow-sm"
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getIconForBuilding(location.icon)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{location.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{location.description}</p>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full mt-1 font-medium">Searched</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                <span className="text-sm text-gray-600">Searching...</span>
              </div>
            </div>
          )}
        </div>

      </aside>

      {/* Map Container */}
      <div className="flex-1 relative h-full">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl
            position="top-right"
            onGeolocate={(position) => {
              setUserLocation({
                longitude: position.coords.longitude,
                latitude: position.coords.latitude
              });
            }}
          />

          {/* Building Markers */}
          {filteredBuildings.map((building) => {
            // Parse coordinates from string format "longitude, latitude"
            const [lng, lat] = building.coordinates.split(', ').map(Number);
            return (
              <Marker
                key={building.id}
                longitude={lng}
                latitude={lat}
                onClick={() => handleBuildingClick(building)}
              >
                <div className={`building-marker ${selectedBuilding?.id === building.id ? 'active' : ''}`}>
                  <div className="marker-pulse"></div>
                  <div className="marker-icon">{getIconForBuilding(building.icon)}</div>
                </div>
              </Marker>
            );
          })}

          {/* Searched Location Markers */}
          {searchedLocations.map((location) => {
            // Parse coordinates from string format "longitude, latitude"
            const [lng, lat] = location.coordinates.split(', ').map(Number);
            return (
              <Marker
                key={location.id}
                longitude={lng}
                latitude={lat}
                onClick={() => handleBuildingClick(location)}
              >
                <div className={`building-marker ${selectedBuilding?.id === location.id ? 'active' : ''}`}>
                  <div className="marker-pulse searched"></div>
                  <div className="marker-icon">{getIconForBuilding(location.icon)}</div>
                </div>
              </Marker>
            );
          })}

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              longitude={userLocation.longitude}
              latitude={userLocation.latitude}
            >
                <div className="user-location-marker">
                <div className="w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </Marker>
          )}

          {/* Start Point Marker */}
          {startPoint && (
            <Marker
              longitude={startPoint.lng}
              latitude={startPoint.lat}
            >
              <div className="start-point-marker">
                <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
              </div>
            </Marker>
          )}

          {/* Building Popup (rebranded compact card) */}
          {selectedBuilding && (() => {
            const [lng, lat] = selectedBuilding.coordinates.split(', ').map(Number);
            return (
              <Popup
                longitude={lng}
                latitude={lat}
                onClose={() => setSelectedBuilding(null)}
                closeButton={false}
                closeOnClick={false}
                anchor="bottom"
                offset={[0, -24]}
              >
                <div className="custom-popup flex items-start gap-3 p-3 bg-white rounded-lg shadow-lg" style={{minWidth: 240, maxWidth: 320}}>
                  {selectedBuilding.imageUrl ? (
                    <img src={selectedBuilding.imageUrl} alt={selectedBuilding.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-emerald-50 rounded-md flex items-center justify-center text-2xl flex-shrink-0">{getIconForBuilding(selectedBuilding.icon)}</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2" style={{position: 'relative'}}>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{selectedBuilding.name}</h4>
                        <p className="text-xs text-gray-500 truncate mt-1">{selectedBuilding.description}</p>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">{selectedBuilding.faculty}</p>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        {/* Move actions to header area so they don't block controls on the map */}
                        <div className="popup-actions-header" aria-hidden>
                          <button
                            onClick={() => startNavigation(selectedBuilding)}
                            className="primary-icon-btn"
                            aria-label="Start navigation"
                            title="Start navigation"
                          >
                            <Navigation size={16} />
                          </button>
                          <button
                            onClick={() => setStartPoint({ lng, lat })}
                            className="secondary-icon-btn"
                            title="Set as start"
                            aria-label="Set as start point"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-target"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                          </button>
                        </div>
                        <button onClick={() => setSelectedBuilding(null)} className="text-gray-400 hover:text-gray-600 ml-2 text-sm">✕</button>
                      </div>
                    </div>

                    {userLocation && (
                      <div className="mt-2 text-xs text-gray-500">{Math.round(calculateDistance(userLocation, selectedBuilding))}m · {Math.ceil(calculateDistance(userLocation, selectedBuilding) / 80)} min</div>
                    )}

                    <div style={{height: 32}} />
                  </div>
                </div>
              </Popup>
            );
          })()}
        </Map>

        {/* Route Layer */}
        {route && route.geometry && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full">
              {/* Route visualization will be handled by Mapbox GL JS */}
            </div>
          </div>
        )}

        {/* Compact Navigation Bar */}
        {isNavigating && route && (
          <div className="absolute bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Navigation size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">Navigating to</h4>
                      <p className="text-xs text-gray-600 truncate">{route.destination.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={stopNavigation}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">Step {currentStepIndex + 1} of {route.steps?.length || 0}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStepIndex + 1) / (route.steps?.length || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-500">{route.distance}</div>
                    <div className="text-xs text-gray-500">{route.duration}</div>
                  </div>
                </div>

                {route.steps && route.steps[currentStepIndex] && (
                  <div className="bg-emerald-50 rounded-xl p-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {currentStepIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium leading-relaxed break-words">
                          {route.steps[currentStepIndex].maneuver.instruction}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {route.steps[currentStepIndex].distance >= 1000
                            ? `${(route.steps[currentStepIndex].distance / 1000).toFixed(1)}km`
                            : `${Math.round(route.steps[currentStepIndex].distance)}m`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={previousStep}
                    disabled={currentStepIndex === 0}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 py-2 px-3 sm:px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm"
                  >
                    <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!route.steps || currentStepIndex >= route.steps.length - 1}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-2 px-3 sm:px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Styles */}
      <style>{`
        /* Ensure mapbox popups appear above other UI layers */
        .mapboxgl-popup, .mapboxgl-popup-content, .mapboxgl-popup-tip {
          z-index: 99999 !important;
        }
        /* Hide Mapbox's default popup chrome so our custom card is the only visible layer
           (prevents the double-card appearance). We still keep the popup container for positioning.) */
        .mapboxgl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .mapboxgl-popup-tip {
          display: none !important;
        }

        /* Compact rebranded popup */
        .custom-popup {
          width: 288px;
          box-shadow: 0 10px 30px rgba(2,6,23,0.12);
          border: 1px solid rgba(0,0,0,0.04);
        }

        /* Centered directions modal */
        .directions-modal {
          --card-radius: 18px;
          border-radius: var(--card-radius);
        }

        .building-marker {
          cursor: pointer;
          position: relative;
          width: 44px;
          height: 44px;
        }
        /* Popup action buttons */
        .custom-popup .popup-actions { display: flex; align-items: center; }
        /* Icon-only primary button (green stroked circle, no filled background) */
        .custom-popup { position: relative; }
        .custom-popup .primary-icon-btn {
          width: 36px; height: 36px; border-radius: 50%; display:flex; align-items:center; justify-content:center;
          background: transparent; color: #059669; border: 2px solid #059669; padding:0; box-shadow: none;
        }
        .custom-popup .primary-icon-btn svg { stroke: #059669; }
        .custom-popup .primary-icon-btn:focus { outline: none; box-shadow: 0 0 0 4px rgba(5,150,105,0.06); }

        /* Secondary icon only, subtle gray background, green stroke */
        .custom-popup .secondary-icon-btn {
          width: 32px; height: 32px; display:flex; align-items:center; justify-content:center;
          background: rgba(243,244,246,0.8); border: none; color: #059669; padding:0; border-radius: 8px;
        }
        .custom-popup .secondary-icon-btn svg { stroke: #059669; width: 16px; height: 16px; }
        .custom-popup .secondary-icon-btn:hover { background: rgba(5,150,105,0.06); }

        /* Position the two icon buttons in header area (to avoid blocking map controls) */
        .custom-popup .popup-actions { display: none; }
        .custom-popup .popup-actions-header { display:flex; gap:8px; align-items:center; }
        .custom-popup .popup-actions-header .primary-icon-btn { width:34px; height:34px; }
        .custom-popup .popup-actions-header .secondary-icon-btn { width:30px; height:30px; }
        .marker-pulse {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          /* use app green for pulses */
          background: rgba(16, 185, 129, 0.25);
          animation: pulse 2s infinite;
          top: 0;
          left: 0;
        }
        .marker-pulse.active {
          background: rgba(16, 185, 129, 0.5);
        }
        .marker-pulse.searched {
          background: rgba(34, 197, 94, 0.35);
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .marker-icon {
          position: relative;
          z-index: 1;
          font-size: 22px;
          background: white;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          border: 3px solid rgba(255,255,255,0.9);
          transition: transform 0.2s ease;
        }
        .marker-icon:hover {
          transform: scale(1.1);
        }
        .user-location-marker {
          animation: pulse-user 2s infinite;
        }
        @keyframes pulse-user {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .start-point-marker {
          animation: pulse-start 2s infinite;
        }
        @keyframes pulse-start {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CampusMap;
