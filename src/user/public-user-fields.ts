// The user fields the API may send to clients. Lists them explicitly, so a
// column added to the User model later stays server-side unless it's added
// here on purpose. Kept separate from UserService so it can be unit tested
// without Prisma or NestJS's DI container.
export const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;
