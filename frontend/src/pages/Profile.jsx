import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from 'lucide-react';

export const Profile = () => {
    const [userData, setUserData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/signin');
            return;
        }

        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get("http://localhost:3000/api/v1/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserData(userResponse.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate('/signin');
                }
            }
        };

        fetchUserData();
    }, [navigate]);

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                        {userData.firstName?.[0]}{userData.lastName?.[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {userData.firstName} {userData.lastName}
                        </h1>
                        <p className="text-gray-600">{userData.username}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">First Name</label>
                                <p className="font-medium">{userData.firstName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Last Name</label>
                                <p className="font-medium">{userData.lastName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Email</label>
                                <p className="font-medium">{userData.username}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};





