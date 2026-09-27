export function toSafeUserResponse(user) {
  const userData = typeof user?.toObject === 'function' ? user.toObject() : user;

  return {
    id: String(userData._id ?? userData.id),
    name: userData.name,
    email: userData.email,
    role: userData.role,
    isActive: userData.isActive,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt
  };
}
