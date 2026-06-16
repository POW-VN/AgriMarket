// src/utils/profileMapper.js

export const getUserRole = (user) => {
  return (
    user?.role ||
    user?.userType ||
    user?.type ||
    user?.accountType ||
    ""
  ).toLowerCase();
};

export const normalizeProfileData = (rawUser) => {
  if (!rawUser) return null;

  const role = getUserRole(rawUser);

  return {
    id: rawUser.id || rawUser.userId || null,
    role,

    fullName:
      rawUser.fullName ||
      rawUser.full_name ||
      rawUser.name ||
      rawUser.displayName ||
      "",

    email: rawUser.email || "",

    phone:
      rawUser.phone ||
      rawUser.phoneNumber ||
      rawUser.phone_number ||
      "",

    avatarUrl:
      rawUser.avatarUrl ||
      rawUser.avatar_url ||
      rawUser.picture ||
      rawUser.photoURL ||
      "",

    status: rawUser.status || "",

    passwordSet: rawUser.passwordSet !== undefined ? rawUser.passwordSet : (rawUser.password_set !== undefined ? rawUser.password_set : true),

    createdAt:
      rawUser.createdAt ||
      rawUser.created_at ||
      "",

    // Farmer
    farmName:
      rawUser.farmName ||
      rawUser.farm_name ||
      "",

    farmAddress:
      rawUser.farmAddress ||
      rawUser.farm_address ||
      "",

    description: rawUser.description || "",

    verificationStatus:
      rawUser.verificationStatus ||
      rawUser.verification_status ||
      "",

    ratingAverage:
      rawUser.ratingAverage ||
      rawUser.rating_average ||
      0,

    totalProducts:
      rawUser.totalProducts ||
      rawUser.total_products ||
      0,

    identityCard:
      rawUser.identityCard ||
      rawUser.identity_card ||
      "",

    businessRegistrationUrl:
      rawUser.businessRegistrationUrl ||
      rawUser.business_registration_url ||
      "",

    vietgapUrl:
      rawUser.vietgapUrl ||
      rawUser.vietgap_url ||
      "",

    globalgapUrl:
      rawUser.globalgapUrl ||
      rawUser.globalgap_url ||
      "",

    organicUrl:
      rawUser.organicUrl ||
      rawUser.organic_url ||
      "",

    // Customer address
    addresses:
      rawUser.addresses ||
      rawUser.customerAddresses ||
      rawUser.customer_address ||
      [],
  };
};

export const buildProfileUpdatePayload = (role, formData) => {
  const basePayload = {
    fullName: formData.fullName,
    phone: formData.phone,
    avatarUrl: formData.avatarUrl,
  };

  if (role === "customer") {
    return {
      ...basePayload,

      // TODO BACKEND:
      // Khi có API customer_address thật,
      // phần này có thể tách riêng thành API:
      // PUT /api/customer-address/{id}
      addresses: formData.address
        ? [
            {
              receiverName: formData.fullName,
              phone: formData.phone,
              address: formData.address,
              isDefault: true,
            },
          ]
        : [],
    };
  }

  if (role === "farmer") {
    return {
      ...basePayload,
      farmName: formData.farmName,
      farmAddress: formData.farmAddress,
      description: formData.description,
      identityCard: formData.identityCard,
      businessRegistrationUrl: formData.businessRegistrationUrl,
      vietgapUrl: formData.vietgapUrl,
      globalgapUrl: formData.globalgapUrl,
      organicUrl: formData.organicUrl,
    };
  }

  return basePayload;
};