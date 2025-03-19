// src/api-chat/userStore.ts

// Users storage - Map of username to socket ID
const users: Map<string, string> = new Map();

export const UserStore = {
  // Add a user
  addUser(username: string, socketId: string): void {
    users.set(username, socketId);
  },

  // Remove a user
  removeUser(username: string): void {
    users.delete(username);
  },

  // Check if username exists
  userExists(username: string): boolean {
    return users.has(username);
  },

  // Get socket ID by username
  getSocketId(username: string): string | undefined {
    return users.get(username);
  },

  // Get all usernames
  getAllUsernames(): string[] {
    return Array.from(users.keys());
  }
};
