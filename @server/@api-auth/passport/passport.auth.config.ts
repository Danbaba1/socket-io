import {Application} from 'express';
import passport from 'passport';
import { localLoginStrategy } from '../passport/strategies/local.login.strategy';
import { localSignupStrategy } from '../passport/strategies/local.signup.strategy';
import { jwtStrategy } from '../passport/strategies/jwt.strategy';



export const configurePassport = (app: Application) => {
  passport.use('local-signup',localSignupStrategy); // basic signup with email and password
  passport.use('local-login',localLoginStrategy); // basic login with email and password
  passport.use(jwtStrategy); // used to extract bearer token 
  app.use(passport.initialize());
}
