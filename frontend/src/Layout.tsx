import React from "react";
import { Outlet } from "react-router";
import useAuthRedirect from "./hooks/useAuthRedirect";
import Sidebar from "./components/layout/Sidebar";

const cleanRoutes = ["/login"];

const Layout = () => {
    const { isCleanRoute } = useAuthRedirect(cleanRoutes);

    return (
        <div className="flex h-screen w-screen">
            {/* Sidebar for protected routes */}
            {!isCleanRoute && <Sidebar isOpen={true} onClose={() => {}} />}

            {/* Main content */}
            <div className="flex-1 bg-gray-50 p-4">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
