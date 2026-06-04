import axios from "axios";

const BASE_URL = "https://provinces.open-api.vn/api";

export const getProvinces = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data; // [{ name, code, ... }]
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
};

export const getDistricts = async (provinceCode) => {
  if (!provinceCode) return [];
  try {
    const response = await axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`);
    return response.data.districts || [];
  } catch (error) {
    console.error(`Error fetching districts for province code ${provinceCode}:`, error);
    return [];
  }
};

export const getWards = async (districtCode) => {
  if (!districtCode) return [];
  try {
    const response = await axios.get(`${BASE_URL}/d/${districtCode}?depth=2`);
    return response.data.wards || [];
  } catch (error) {
    console.error(`Error fetching wards for district code ${districtCode}:`, error);
    return [];
  }
};

/**
 * Normalizes administrative unit names by converting to lowercase and stripping prefixes
 * like "Tỉnh", "Thành phố", "Quận", "Huyện", "Phường", "Xã", etc. for fuzzy matching.
 */
export const normalizeName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents for even more robust match
    .replace(/^(tinh|thanh pho|quan|huyen|thi xa|phuong|xa|thi tran)\s+/gi, "")
    .trim();
};

/**
 * Splits a concatenated address string into 4 components: street, ward, district, province.
 */
export const parseAddress = (addressStr) => {
  if (!addressStr || addressStr === "Chưa cập nhật" || addressStr === "Not updated") {
    return { street: "", ward: "", district: "", province: "" };
  }

  const parts = addressStr.split(",").map((part) => part.trim());

  if (parts.length >= 4) {
    const province = parts[parts.length - 1];
    const district = parts[parts.length - 2];
    const ward = parts[parts.length - 3];
    const street = parts.slice(0, parts.length - 3).join(", ");
    return { street, ward, district, province };
  } else if (parts.length === 3) {
    const province = parts[2];
    const district = parts[1];
    return { street: parts[0], ward: "", district, province };
  } else if (parts.length === 2) {
    const province = parts[1];
    return { street: parts[0], ward: "", district: "", province };
  } else {
    return { street: addressStr, ward: "", district: "", province: "" };
  }
};

/**
 * Concatenates components into a standardized address string.
 */
export const formatAddress = ({ street, ward, district, province }) => {
  return [street, ward, district, province]
    .map((item) => item?.trim())
    .filter(Boolean)
    .join(", ");
};
