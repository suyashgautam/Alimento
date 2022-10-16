const multer = require('multer');

const storageCustomer = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './views/Customer/image/');
    },
    filename: function(req, file, cb) {
        cb(null, (new Date().toISOString().replace(/:/g, '-')));
    }
});

const initializePassport = require('./passport-config');

app.get('/cart', checkAuthenticated, (req, res) => {
    if(req.user.type === 'customer')
    {
        res.render('./Customer/CustomerCart.ejs');
    }
    else
        res.redirect('/profile');
})

app.get('/cartdishes', checkAuthenticated, (req, res) => {
    const c_email = req.user.email
    getCartDishes(c_email, (message) => {
        res.json(message);
    })
})

app.post('/cart', (req, res) => {
    if(typeof req.user === 'undefined')
    {
        console.log('true');
        res.json({message: "Please Login"});
    }
    else
    {
        if(typeof req.user !== 'undefined' && req.user.type === 'customer')
        {
            const data = {
                c_email: req.user.email,
                d_id: req.body.d_id,
                d_name: req.body.d_name,
                d_cost: req.body.d_cost,
                rest_id: req.body.rest_id,
            }
            addToCartDB(data, (message) => {
                res.json(message);
            })
        }
        else
        {
            res.json({message: 'Not Allowed'});
        }
    }
})

app.patch('/cart', (req, res) => {
    const data = {
        qty: req.body.qty,
        d_id: req.body.d_id,
        c_email: req.body.c_email,
    }
    updateCartQty(data, (message) => {
        res.json(message);
    })
})

app.delete('/cart', (req, res) => {
    const data = {
        d_id: req.query.dish,
        email: req.user.email
    }
    deleteFromCart(data, (message) => {
        res.json(message);
    })
})

app.post('/cprofile', uploadCustomer.single('cimage'), (req, res) => {
    const data = {
        c_email: req.body.cemail,
        c_name: req.body.cname,
        c_address: req.body.caddress,
        c_phone:req.body.cphone,
        c_image:(req.file !== undefined) ? ((req.file.path.replace('views\\','')).replace('\\', '/')).replace('\\','/') : '',
    }
    updateProfile(data, "customer", (message) => {
        res.redirect('/profile?flag=true');
    })
})

app.get('/customerlogin', checkNotAuthenticated, (req, res) => {
    const message = (req.flash().error) || '';
    res.render("./Customer/CustomerLogin.ejs", {message});
})

app.post('/customerlogin', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/customerlogin',
    failureFlash: true,
}))

app.get('/customersignup', (req, res) => {
    res.render("./Customer/CustomerRegistration.ejs", {"message": -1});
})

app.post('/customersignup', uploadCustomer.single('cimage'), (req, res) => {
    bcrypt.hash(req.body.cpassword, 10, function(err, password){
        if(err){
            res.json({
                "message": "User not added"
            })
        }
        const data = {
            name: req.body.cname,
            phone: req.body.cphone,
            preference: req.body.cpreference,
            address: req.body.caddress,
            email: req.body.cemail,
            password: password,
            image: (req.file !== undefined) ? ((req.file.path.replace('views/','')).replace('/', '//')) : '',      
        }
        addCustomer(data, (message) => {
            res.render("./Customer/CustomerRegistration.ejs", {
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