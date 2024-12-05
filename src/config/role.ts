const allRoles: { [role: string]: string[] } = {
  user: ['getUser'],
  admin: ['getUser', 'getUsers', 'manageUsers']
};

// roles adalah array string yang berisi nama-nama role
export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
