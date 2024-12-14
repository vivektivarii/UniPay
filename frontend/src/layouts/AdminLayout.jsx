import React from 'react';
import { useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';

const AdminLayout = ({ children }) => {
    const location = useLocation();

    // Define paths where the sidebar should not be displayed
    const noSidebarPaths = ['/admin/signin', '/admin/signup'];

    return (
        <div className="flex">
            {/* Conditionally render the AdminSidebar */}
            {!noSidebarPaths.includes(location.pathname) && <AdminSidebar />}
            <div className="flex-1 p-6">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout; 