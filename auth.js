//JavaScript Document

const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport');

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d', //Expiration time length in days
    algorithm: 'HS256' //Encodes the values of the JWT
  });
}

//POST login.
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, users, info) => {
      if (error || !users) {
        return res.status(400).json({
          message: 'Something is wrong.',
          user: users
        });
      }
      req.login(users, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(users.toJSON());
        return res.json({ users, token });
      });
    })(req, res);
  });
}
