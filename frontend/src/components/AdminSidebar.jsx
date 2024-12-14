import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CreditCard, Bell, ChevronLeft, ChevronRight, LogOut, User, BarChart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [userData, setUserData] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate('/admin/signin');
        return;
    }

    const fetchUserData = async () => {
        try {
            const userResponse = await axios.get("http://localhost:3000/api/v1/admin/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserData(userResponse.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate('/admin/signin');
            }
        }
    };

    fetchUserData();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate('/admin/signin');
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, text: 'Students', path: '/admin/students'},
    { icon: CreditCard, text: 'Fees', path: '/admin/fees' },
    { icon: Bell, text: 'Notifications', path: '/admin/notifications' },
    { icon: BarChart, text: 'Reports', path: '/admin/reports' },
    { icon: User, text: 'Profile', path: '/admin/profile' },
  ];

  return (
    <div 
      className={`relative h-screen bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 bg-white rounded-full p-1.5 text-gray-900 shadow-lg hover:bg-gray-100"
      >
        {isExpanded ? (
          <ChevronLeft size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>

      <div className="p-6 flex-1">
        {/* Logo */}
        <div className={`flex items-center gap-2 mb-8 ${
          isExpanded ? '' : 'justify-center'
        }`}>
          <Users className="text-blue-600" size={24} />
          {isExpanded && (
            <span className="text-xl font-bold text-gray-900">
              Admin Panel
            </span>
          )}
        </div>

        <nav className="flex flex-col gap-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 transition-all duration-200 ${
                isExpanded ? 'px-2' : 'justify-center px-0'
              } py-2 rounded-lg ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {isExpanded && (
                <span>
                  {item.text}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Profile Section at Bottom */}
      <div className="mt-auto border-t p-4">
        <div className={`flex items-center gap-3 ${!isExpanded && 'justify-center'}`}>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {userData.firstName?.[0]}{userData.lastName?.[0]}
          </div>
          {isExpanded && (
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800">
                {userData.firstName} {userData.lastName}
              </h3>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-3 flex flex-col gap-2">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Tooltip container for collapsed state */}
      {!isExpanded && (
        <div className="relative">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="hidden group-hover:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap"
              style={{ top: `${index * 2.5}rem` }}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 