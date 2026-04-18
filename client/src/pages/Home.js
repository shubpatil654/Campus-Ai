import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { collegeService } from '../services/collegeService';
import LeafletMap from '../components/LeafletMap';
import Navbar from '../components/Navbar';
import {
  MessageSquare,
  Search,
  MapPin,
  Star,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Globe,
  BookOpen,
  GraduationCap,
  Rocket,
  X,
  Send,
  Bot,
  LogOut,
  User
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! I\'m your AI college assistant. How can I help you find the perfect college today?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Show welcome notification only when user first logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if this is a fresh login by checking if we have a recent login timestamp
      const lastLoginTime = localStorage.getItem('lastLoginTime');
      const currentTime = Date.now();
      
      // If no last login time or it's been more than 1 minute, show welcome
      if (!lastLoginTime || (currentTime - parseInt(lastLoginTime)) > 60000) {
        setShowWelcome(true);
        localStorage.setItem('lastLoginTime', currentTime.toString());
        
        // Hide welcome notification after 5 seconds
        const timer = setTimeout(() => {
          setShowWelcome(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user]);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Chatbot',
      description: 'Get instant answers about colleges, courses, and admissions through our intelligent chatbot.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Zap,
      title: 'Smart College Search',
      description: 'Find the perfect college with advanced filtering by stream, fees, location, and more.',
      color: 'from-orange-400 to-red-500'
    },
    {
      icon: Target,
      title: 'Interactive Maps',
      description: 'Explore college locations visually with our integrated mapping system.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: TrendingUp,
      title: 'Personalized Recommendations',
      description: 'Get college suggestions based on your preferences and academic profile.',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const stats = [
    { number: '-', label: 'Colleges Listed', icon: Globe, color: 'text-yellow-400', key: 'colleges' },
    { number: '-', label: 'Students Helped', icon: Users, color: 'text-orange-400', key: 'students' },
    { number: '95%', label: 'Satisfaction Rate', icon: Award, color: 'text-yellow-500' },
    { number: '24/7', label: 'AI Support', icon: MessageSquare, color: 'text-orange-500' }
  ];

  // Featured colleges from API
  const { data: featuredColleges, isLoading: isLoadingFeatured } = useQuery(
    'featured-colleges',
    () => collegeService.getTopRatedColleges(3),
    { 
      keepPreviousData: true,
      retry: 3,
      retryDelay: 5000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );

  // All colleges for map display
  const { data: allColleges, isLoading: isLoadingAllColleges, error: allCollegesError } = useQuery(
    'all-colleges-map',
    () => collegeService.getAllColleges(),
    { 
      keepPreviousData: true,
      retry: 3,
      retryDelay: 5000, // Wait 5 seconds between retries
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      refetchOnWindowFocus: false // Don't refetch when window gains focus
    }
  );

  // Use static stats to avoid API rate limiting
  const statsData = {
    colleges: 1, // We know there's 1 college
    students: 150 // Static value
  };

  const colleges = featuredColleges?.data ?? [];

  // Prepare map markers from colleges with coordinates
  const mapMarkers = React.useMemo(() => {
    // Handle both array and object with data property
    const collegesData = Array.isArray(allColleges) ? allColleges : allColleges?.data;
    
    if (!collegesData || !Array.isArray(collegesData)) {
      return [];
    }
    
    const collegesWithCoords = collegesData.filter(college => {
      return college.latitude && college.longitude;
    });
    
    const markers = collegesWithCoords.map(college => ({
      id: college.id,
      position: [parseFloat(college.latitude), parseFloat(college.longitude)],
      title: `
        <div class="p-2">
          <h3 class="font-bold text-lg text-gray-800">${college.name}</h3>
          <p class="text-gray-600 text-sm">${college.location}</p>
          <p class="text-gray-500 text-xs mt-1">${college.description || 'No description available'}</p>
          <div class="mt-2">
            <a href="/colleges/${college.id}" class="inline-block bg-yellow-400 text-black px-3 py-1 rounded text-xs font-medium hover:bg-yellow-500 transition-colors">
              View Details
            </a>
          </div>
        </div>
      `
    }));
    
    return markers;
  }, [allColleges]);

  // Calculate map center from college coordinates
  const mapCenter = React.useMemo(() => {
    if (mapMarkers.length === 0) return [12.9716, 77.5946]; // Default to Bangalore
    
    const avgLat = mapMarkers.reduce((sum, marker) => sum + marker.position[0], 0) / mapMarkers.length;
    const avgLng = mapMarkers.reduce((sum, marker) => sum + marker.position[1], 0) / mapMarkers.length;
    
    return [avgLat, avgLng];
  }, [mapMarkers]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: 'Thanks for your message! I\'m here to help you find the perfect college. What specific information are you looking for?',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-transparent relative">
      {/* Black Basic Grid Background - Fixed */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "#000000",
          backgroundImage: `
            linear-gradient(to right, rgba(75, 85, 99, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(75, 85, 99, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      
      {/* Welcome Notification */}
      {showWelcome && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 shadow-2xl shadow-yellow-400/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h3>
                <p className="text-gray-300 text-sm">
                  Ready to explore colleges and get AI-powered guidance?
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 rounded-full px-6 py-2 mb-8">
              <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-medium">AI-Powered College Discovery</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                College Match
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover colleges, explore courses, and get AI-powered guidance to make the best decision for your future.
            </p>
            
                         <div className="flex justify-center items-center mb-16">
               <Link
                 to="/colleges"
                 className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg px-10 py-4 rounded-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 flex items-center"
               >
                 <Rocket className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                 Explore Colleges
                 <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
               </Link>
             </div>

                         {/* Hero Stats */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
               {stats.map((stat, index) => {
                 const Icon = stat.icon;
                 let displayNumber = stat.number;
                 
                                 // Use dummy data for screenshots
                if (stat.key === 'colleges') {
                  displayNumber = '3';
                } else if (stat.key === 'students') {
                  displayNumber = '150';
                }
                 
                 return (
                   <div key={index} className="text-center group">
                     <div className={`text-3xl md:text-4xl font-black ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
                       {displayNumber}
                     </div>
                     <div className="text-gray-400 font-medium">{stat.label}</div>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
        
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">CampusAI</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our platform combines cutting-edge AI technology with comprehensive college data to help you make informed decisions.
            </p>
          </div>
          
                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {features.map((feature, index) => {
               const Icon = feature.icon;
               
               return (
                 <div key={index} className="group relative">
                   {/* Glow effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                   
                                       {/* Main card */}
                    <div className="relative bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 text-center hover:border-yellow-400/40 transition-all duration-300 transform hover:scale-105 h-full flex flex-col">
                      {/* Icon container with different styles */}
                      <div className={`w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg rounded-2xl flex items-center justify-center ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                        index === 2 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                        'bg-gradient-to-br from-orange-500 to-red-600'
                      }`}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-bold text-white mb-4 flex-1">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-300 leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      </section>

      {/* Featured Colleges Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Featured Colleges in <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Bangalore</span>
            </h2>
            <p className="text-xl text-gray-300">
              Discover top engineering colleges in your region
            </p>
          </div>
          
                     <div className="grid md:grid-cols-3 gap-8">
             {colleges.map((college, index) => (
               <div key={college.id} className="group relative">
                 {/* Glow effect */}
                 <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                 
                                   {/* Main card */}
                  <div className="relative bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl overflow-hidden hover:border-yellow-400/40 transition-all duration-300 transform hover:scale-105 h-full flex flex-col shadow-lg hover:shadow-2xl hover:shadow-yellow-400/20">
                    {/* Header image */}
                    <div className="h-48 bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="text-center text-white relative z-10">
                        <div className="text-5xl font-black mb-2 drop-shadow-lg">{college.name.charAt(0)}</div>
                        <div className="text-sm font-medium opacity-90">{college.name}</div>
                      </div>
                      <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                        Featured
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold text-white mb-4 line-clamp-1">
                        {college.name}
                      </h3>
                      <p className="text-gray-300 mb-6 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-yellow-400" />
                        {college.location}
                      </p>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <Star className="h-6 w-6 text-yellow-400 fill-current" />
                          <span className="ml-2 text-white font-bold text-lg">{college.rating}</span>
                          <span className="text-gray-400 ml-2">({college.total_ratings} reviews)</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Link
                          to={`/colleges/${college.id}`}
                          className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
                        >
                          Learn More
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </section>

       {/* Interactive Map Section */}
       <section className="py-4 relative w-full">
         <div className="w-full px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-4">
             <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
               Explore Colleges on <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Interactive Map</span>
             </h2>
             <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
               {mapMarkers.length > 0 
                 ? `Discover ${mapMarkers.length} college locations, get directions, and explore the educational landscape`
                 : 'Discover college locations, get directions, and explore the educational landscape'
               }
             </p>
           </div>
           
           <div className="relative w-full h-screen">
             {/* Glowing border effect */}
             <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-500/30 to-yellow-400/30 rounded-2xl blur-sm animate-pulse"></div>
             <div className="absolute inset-[2px] bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-yellow-400/20 rounded-2xl blur-sm"></div>
             
             {/* Map container with border */}
             <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-yellow-400/50 shadow-2xl shadow-yellow-400/30 hover:border-yellow-400/70 hover:shadow-yellow-400/40 transition-all duration-300">
               {isLoadingAllColleges ? (
                 <div className="h-full flex items-center justify-center bg-gray-700/50">
                   <div className="text-white">Loading colleges...</div>
                 </div>
               ) : allCollegesError ? (
                 <div className="h-full flex items-center justify-center bg-gray-700/50">
                   <div className="text-center text-gray-300">
                     <MapPin className="h-12 w-12 mx-auto mb-4 text-red-500" />
                     <p className="text-lg font-medium text-red-400">Failed to load colleges</p>
                     <p className="text-sm">Please refresh the page to try again</p>
                     <button 
                       onClick={() => window.location.reload()} 
                       className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                     >
                       Refresh Page
                     </button>
                   </div>
                 </div>
               ) : mapMarkers.length === 0 ? (
                 <div className="h-full flex items-center justify-center bg-gray-700/50">
                   <div className="text-center text-gray-300">
                     <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                     <p className="text-lg font-medium">No colleges with location data</p>
                     <p className="text-sm">Colleges need to add their coordinates to appear on the map</p>
                   </div>
                 </div>
               ) : (
                 <LeafletMap 
                   center={mapCenter}
                   zoom={12}
                   markers={mapMarkers}
                   height="100%"
                 />
               )}
             </div>
           </div>
         </div>
       </section>

       {/* CTA Section */}
       <section className="py-12 relative">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-3xl blur-2xl"></div>
             <div className="relative bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-3xl p-16">
               <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
                 Ready to Find Your Perfect College?
               </h2>
               <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                 Join thousands of students who have already discovered their ideal college match with CampusAI.
               </p>
               <Link
                 to="/colleges"
                 className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl px-12 py-5 rounded-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105"
               >
                 Explore Colleges Now
                 <Rocket className="ml-3 h-6 w-6" />
               </Link>
             </div>
           </div>
         </div>
       </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm border-t border-yellow-400/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-black font-bold text-2xl">C</span>
                </div>
                <span className="ml-4 text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  CampusAI
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Your AI-powered college discovery platform with cutting-edge technology and comprehensive data.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Platform</h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link to="/colleges" className="hover:text-yellow-400 transition-colors">College Search</Link></li>
                <li><Link to="/chatbot" className="hover:text-yellow-400 transition-colors">AI Chatbot</Link></li>
                <li><Link to="/about" className="hover:text-yellow-400 transition-colors">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link to="/help" className="hover:text-yellow-400 transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-yellow-400 transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-yellow-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Legal</h3>
              <ul className="space-y-3 text-gray-300">
                <li><Link to="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
                     <div className="border-t border-yellow-400/20 mt-12 pt-8 text-center text-gray-300">
                           <p>&copy; 2025 CampusAI. All rights reserved. Made with ❤️ for students.</p>
           </div>
         </div>
       </footer>

       {/* Floating chat is provided globally in App */}
     </div>
   );
 };

export default Home;
