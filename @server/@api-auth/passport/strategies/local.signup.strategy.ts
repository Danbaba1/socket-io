import {Strategy} from 'passport-local';
import { UserModel as User } from '../../../@api-user/user.model';
import { DoneCallback } from 'passport';
import { success } from '../../../lib/helpers';
import bcrypt from 'bcrypt';

export const localSignupStrategy = new Strategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: false,
  },
  async (email: string, password: string, done: (error: any, user?: any, info?: any) => void) =>{
    try {
      const createUser = new User({
        email: email,
        password: password,
      });
      const user = await createUser.save();
      success(`${email} just signed up`);
      done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);
