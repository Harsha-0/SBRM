import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  UserMinus,
  DollarSign,
} from "lucide-react";
import { Button } from "./ui/button.jsx";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <aside
      className={`bg-white transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "w-16" : "w-64"
      } flex flex-col`}
    >
      <div className="flex h-16 items-center justify-between p-4">
        {!sidebarCollapsed && <h2 className="text-xl font-bold">Dashboard</h2>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <nav className="flex-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 ${
              isActive ? "bg-gray-200" : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Home className="h-5 w-5" />
          {!sidebarCollapsed && <span>Overview</span>}
        </NavLink>
        <NavLink
          to="/employees"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 ${
              isActive ? "bg-gray-200" : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Users className="h-5 w-5" />
          {!sidebarCollapsed && <span>Employees</span>}
        </NavLink>
        <NavLink
          to="/offboarded-resources"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 ${
              isActive ? "bg-gray-200" : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <UserMinus className="h-5 w-5" />
          {!sidebarCollapsed && <span>Offboarded Resources</span>}
        </NavLink>
        <NavLink
          to="/gross-margin-calculation-oh"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 ${
              isActive ? "bg-gray-200" : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <DollarSign className="h-5 w-5" />
          {!sidebarCollapsed && <span>Gross Margin Calculation</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
