const DEFAULT_MINOR_ADMIN_PERMISSIONS = {
  journal: true,
  productContent: true,
  inventory: true,
  support: true,
  moderation: true,
  analytics: true,
};

const normalizeMinorPermissions = (permissions) => ({
  ...DEFAULT_MINOR_ADMIN_PERMISSIONS,
  ...(permissions || {}),
});

export { DEFAULT_MINOR_ADMIN_PERMISSIONS, normalizeMinorPermissions };
