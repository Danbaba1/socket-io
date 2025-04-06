import { UserModel } from '../@api-user/user.model.js';
import { badRequestErr, notFoundErr } from '../lib/errors/Errors.js';

export const usernameService = {
  async addOrUpdateUsername(userId: string, username: string) {
    if (!username || username.trim().length < 3) {
      badRequestErr('Username must be at least 3 characters long');
    }
    
    // Check if username already exists for another user
    const existingUser = await UserModel.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      badRequestErr('Username already taken');
    }
    
    // Update the user's username
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { username },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      notFoundErr('User not found');
    }
    
    // Using non-null assertion operator to tell TypeScript that updatedUser cannot be null here
    return {
      userId: updatedUser!._id,
      username: updatedUser!.username,
      email: updatedUser!.email
    };
  },
  
  async getUserByUsername(username: string) {
    const user = await UserModel.findOne({ username });
    if (!user) {
      notFoundErr('User not found');
    }
    
    // Using non-null assertion operator to tell TypeScript that user cannot be null here
    return {
      userId: user!._id,
      username: user!.username,
      email: user!.email
    };
  }
};
