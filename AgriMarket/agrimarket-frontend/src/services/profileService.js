// src/services/profileService.js

import { PROFILE_STORAGE_KEYS, USER_ROLES } from "../constants/profileConstants";
import { normalizeProfileData } from "../utils/profileMapper";

// TODO BACKEND API:
// Khi nhóm bạn đã có file apiClient.js hoặc axios instance,
// mở dòng này ra để gọi API thật.
// import apiClient from "./apiClient";

const getLocalUser = () => {
  const userStr = localStorage.getItem(PROFILE_STORAGE_KEYS.USER);

  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Không đọc được dữ liệu user trong localStorage:", error);
    return null;
  }
};

const saveLocalUser = (user) => {
  localStorage.setItem(PROFILE_STORAGE_KEYS.USER, JSON.stringify(user));
};

const getCurrentProfile = async () => {
  const localUser = getLocalUser();

  if (!localUser) return null;

  const normalizedUser = normalizeProfileData(localUser);

  // TODO BACKEND API:
  // Khi backend có API lấy profile theo user hiện tại,
  // thay phần return localStorage bằng gọi API.
  //
  // Ví dụ:
  // const response = await apiClient.get("/profile/me");
  // return normalizeProfileData(response.data);
  //
  // Hoặc nếu backend tách riêng:
  // GET /api/customers/{id}
  // GET /api/farmers/{id}
  // GET /api/admins/{id}

  return normalizedUser;
};

const updateProfile = async (profileData) => {
  const currentUser = getLocalUser();

  if (!currentUser) {
    throw new Error("Không tìm thấy người dùng hiện tại.");
  }

  const normalizedUser = normalizeProfileData(currentUser);

  if (normalizedUser.role === USER_ROLES.ADMIN) {
    throw new Error("Admin không được chỉnh sửa hồ sơ.");
  }

  // TODO BACKEND API:
  // Khi backend có API update profile, thay phần lưu localStorage bằng gọi API.
  //
  // Ví dụ:
  // if (normalizedUser.role === "customer") {
  //   const response = await apiClient.put(`/api/customers/${normalizedUser.id}`, profileData);
  //   saveLocalUser(response.data);
  //   return normalizeProfileData(response.data);
  // }
  //
  // if (normalizedUser.role === "farmer") {
  //   const response = await apiClient.put(`/api/farmers/${normalizedUser.id}`, profileData);
  //   saveLocalUser(response.data);
  //   return normalizeProfileData(response.data);
  // }

  const updatedUser = {
    ...currentUser,
    ...profileData,
    role: normalizedUser.role,
  };

  saveLocalUser(updatedUser);

  return normalizeProfileData(updatedUser);
};

const logout = () => {
  localStorage.removeItem(PROFILE_STORAGE_KEYS.USER);
  localStorage.removeItem(PROFILE_STORAGE_KEYS.TOKEN);
};

const profileService = {
  getCurrentProfile,
  updateProfile,
  logout,
};

export default profileService;