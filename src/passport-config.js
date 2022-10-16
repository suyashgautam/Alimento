const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail) {
  const authenticateUser = (req, email, password, done) => {
    if(req.originalUrl.includes("customer"))
    {
        flag = "customer"
    }
    else
    {
        flag = "restaurant"
    }
    getUserByEmail(email, flag, async (user) => {
        if (user == null) {
            return done(null, false, { message: 'No user with that email' })
          }
          try {
            if (await bcrypt.compare(password, user.password)) {
              return done(null, user)
            } else {
              console.log("Password incorrect");
              return done(null, false, { message: 'Password incorrect' })
            }
          } catch (e) {
            return done(e)
          }  
    })
  }

  passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback:true }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser(async (user, done) => {
    await getUserByEmail(user.email, user.type, user => {
        return done(null, user);
    })
  })
}

module.exports = initialize