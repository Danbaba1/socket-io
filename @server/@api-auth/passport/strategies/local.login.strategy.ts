import {Strategy} from 'passport-local';
import { UserModel as User } from '../../../@api-user/user.model.js';
import bcrypt from 'bcrypt'
import { success } from '../../../lib/helpers/index.js';

export const localLoginStrategy = new Strategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: false,
  },
  async (email: string, password: string, done: (error: any, user?: any, info?: any) => void) =>{
    try {
      const user = await User.findOne({email: email}).exec();
      if (!user) {
        return done(null, false, { message: "Invalid Credentials [email]" });
      }
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return done(null, false, { message: "Invalid Credentials [password]" });
      }
      success(`${email} just logged in`);
      done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);
