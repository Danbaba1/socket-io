import mongoose from 'mongoose';
import bcrypt from "bcrypt";

export enum UserRole {
  User = 'user',
}

export interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  email_verified: boolean;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const collectionName = 'user';

const UserSchema = new mongoose.Schema({
  email: {
    type: String, 
    required: true, 
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "please provide valid email",
    ]
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email_verified: { type: Boolean, required: true, default: false },
  password: { type: String, required: true },
  role: { type: String, required: true, default: UserRole.User }
},
{
  timestamps: true,
});

UserSchema.pre('save', async function(next){
  // Only run this function if password was modified (not on other update functions)
  if (!this.isModified("password")){
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  return next();
});

const UserModel = mongoose.model<UserDocument>(collectionName, UserSchema, collectionName);

export { UserModel };
