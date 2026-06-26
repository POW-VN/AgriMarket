// src/services/wishlistService.js

import { getProductById } from "./productService";

const WISHLIST_KEY = "agrimarket_wishlist";

const getWishlistIds = () => {
  try {
    const list = localStorage.getItem(WISHLIST_KEY);
    return list ? JSON.parse(list) : [];
  } catch (e) {
    console.error("Lỗi khi đọc danh sách yêu thích từ localStorage:", e);
    return [];
  }
};

const saveWishlistIds = (ids) => {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error("Lỗi khi ghi danh sách yêu thích vào localStorage:", e);
  }
};

const toggleWishlist = (productId) => {
  const ids = getWishlistIds();
  const prodIdStr = String(productId);
  const index = ids.indexOf(prodIdStr);
  let saved = false;

  if (index > -1) {
    ids.splice(index, 1);
  } else {
    ids.push(prodIdStr);
    saved = true;
  }

  saveWishlistIds(ids);
  
  // Dispatch custom event to notify components about the update
  window.dispatchEvent(new CustomEvent("wishlistUpdated", { detail: { productId: prodIdStr, saved } }));
  
  return { saved, message: saved ? "Đã lưu vào danh sách yêu thích." : "Đã xóa khỏi danh sách yêu thích." };
};

const isWishlistItem = (productId) => {
  const ids = getWishlistIds();
  return ids.includes(String(productId));
};

const getWishlistProducts = async () => {
  const ids = getWishlistIds();
  if (ids.length === 0) return [];
  
  try {
    const promises = ids.map(id => getProductById(id));
    const results = await Promise.all(promises);
    // Filter out any null or invalid products
    return results.filter(Boolean);
  } catch (e) {
    console.error("Lỗi khi lấy thông tin chi tiết các sản phẩm yêu thích:", e);
    return [];
  }
};

const getFollowedFarmers = () => {
  try {
    const list = localStorage.getItem("agrimarket_followed_farmers");
    return list ? JSON.parse(list) : [];
  } catch (e) {
    console.error("Lỗi khi đọc danh sách theo dõi từ localStorage:", e);
    return [];
  }
};

const isFarmerFollowed = (farmerId) => {
  const list = getFollowedFarmers();
  return list.some(f => String(f.id) === String(farmerId));
};

const toggleFollowFarmer = (farmer) => {
  if (!farmer || !farmer.id) return { followed: false };
  const list = getFollowedFarmers();
  const idStr = String(farmer.id);
  const index = list.findIndex(f => String(f.id) === idStr);
  let followed = false;

  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(farmer);
    followed = true;
  }

  try {
    localStorage.setItem("agrimarket_followed_farmers", JSON.stringify(list));
  } catch (e) {
    console.error("Lỗi khi ghi danh sách theo dõi vào localStorage:", e);
  }

  return { followed, message: followed ? "Đã theo dõi nhà vườn." : "Đã hủy theo dõi nhà vườn." };
};

const wishlistService = {
  getWishlistIds,
  toggleWishlist,
  isWishlistItem,
  getWishlistProducts,
  getFollowedFarmers,
  isFarmerFollowed,
  toggleFollowFarmer,
};

export default wishlistService;
