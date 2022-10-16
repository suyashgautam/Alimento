const multer = require('multer');

const storageRestaurant = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './views/Restaurants/image/');
    },
    filename: function(req, file, cb) {
        cb(null, (new Date().toISOString().replace(/:/g, '-')));
    }
});

const initializePassport = require('./passport-config');

app.post('/rprofile', uploadRestaurant.single('rimage'), (req, res) => {
    const data = {
        r_email: req.body.remail,
        r_name: req.body.rname,
        r_address: req.body.raddress,
        r_image:(req.file !== undefined) ? ((req.file.path.replace('views\\','')).replace('\\', '/')).replace('\\','/') : '',
    }
    updateProfile(data, "restaurant", (message) => {
        res.redirect('/profile?flag=true');
    })
})

app.get('/getallrestaurants', (req, res) => {
    getAllRestaurants((result) => {
        res.json(result);
    })
})

app.get('/restaurantlogin', checkNotAuthenticated, (req, res) => {
    const message = (req.flash().error) || '';
    res.render("./Restaurants/RestaurantLogin.ejs", {message});
})

app.post('/restaurantlogin', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/restaurantlogin',
    failureFlash: true,
}))

app.get('/restaurantsignup', (req, res) => {
    res.render("./Restaurants/RestaurantRegistration.ejs", {"message": -1});
})

app.post('/restaurantsignup', uploadRestaurant.single('rimage'), (req, res) => {
    bcrypt.hash(req.body.rpassword, 10, function(err, password){
        if(err){
            res.json({
                "message": "User not added"
            })
        }
        const data = {
            name: req.body.rname,
            address: req.body.raddress,
            email: req.body.remail,
            password: password,
            image: (req.file !== undefined) ? ((req.file.path.replace('views\\','')).replace('\\', '/')).replace('\\','/') : '',    
        }
        addRestaurant(data, (message) => {
            res.render("./Restaurants/RestaurantRegistration.ejs",{
                "message": 1
            })
        })
    })
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/customerlogin')
}
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}