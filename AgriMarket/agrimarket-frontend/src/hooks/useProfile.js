// src/hooks/useProfile.js

import { useEffect, useState } from "react";
import profileService from "../services/profileService";

const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const loadProfile = async () => {
    try {
      setIsProfileLoading(true);
      setProfileError("");

      const currentProfile = await profileService.getCurrentProfile();
      setProfile(currentProfile);
    } catch (error) {
      console.error("Load profile error:", error);
      setProfileError("Không thể tải hồ sơ người dùng.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    try {
      const updatedProfile = await profileService.updateProfile(payload);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    isProfileLoading,
    profileError,
    loadProfile,
    updateProfile,
  };
};

export default useProfile;