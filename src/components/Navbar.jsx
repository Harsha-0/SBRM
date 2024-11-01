import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.jsx";
import { Button } from "./ui/button.jsx";
import supabase from "../utils/SupabaseClient.js";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <span className="text-lg font-semibold">
            Corvano Resource Management
          </span>
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <>
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="font-medium">Loading...</span>
            </>
          ) : (
            <>
              <Avatar>
                <AvatarImage
                  src={
                    user.user_metadata.avatar_url ||
                    user.user_metadata.full_name
                  }
                  alt={
                    user.user_metadata.full_name || user.user_metadata.full_name
                  }
                />
                <AvatarFallback>
                  {user.user_metadata.full_name
                    ? user.user_metadata.full_name.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {user.user_metadata.full_name || "User"}
              </span>
            </>
          )}
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
