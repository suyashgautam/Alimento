const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session')
const flash = require('express-flash')
const bodyParser = require('body-parser');
const cors = require('cors')
const path = require('path')
const jwt = require('jsonwebtoken')
const multer = require('multer');

const port = process.env.PORT || 3000

const storageCustomer = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './views/Customer/image/');
    },
    filename: function(req, file, cb) {
        cb(null, (new Date().toISOString().replace(/:/g, '-')));
    }
});

const storageRestaurant = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './views/Restaurants/image/');
    },
    filename: function(req, file, cb) {
        cb(null, (new Date().toISOString().replace(/:/g, '-')));
    }
});

const {getAllDishes, getAllRestaurants, addCustomer, addRestaurant, getUserDetails, 
    updatePassword, allDishes, addDish, updateDish, deleteDish, getDish, updateProfile, 
    addToCartDB, getCartDishes, updateCartQty, deleteFromCart, addOrder, removeCart, getAllOrders, 
    resetPassword, searchDishes, searchRestaurants, getRestaurant, getRestaurantwithFilter, 
    addRestReview, addDishReview, getReviews, confirmOrder, getOrderDetails, getRestIdFromCart} = require('./db/dbQueries.js')

const {createInvoice} = require('./invoice/invoice');

const { sendForgotPasswordLink, sendWelcomeEmail, orderCancelled, orderDelievered } = require('./emails/account')

const initializePassport = require('./passport-config');
const { response } = require('express');

const uploadCustomer = multer({storage: storageCustomer});
const uploadRestaurant = multer({storage: storageRestaurant});

const app = express();

initializePassport(
  passport,
  getUserDetails
)

const stripe = require("stripe")('sk_test_51LeBqLSAC3oFfcSVQOaRS6A1h2fk8HDto6itbfNOj5e2rzaj6yD1kfn94WHiftDUJGbCOp0dthI0aWY9AuYjBTUC00w4Y2oPHx')

app.set('view engine', 'ejs');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static(path.join(__dirname, '../views')));
app.use(cors({
    origin: '*',
}));
app.options('*', cors())

app.use(flash())
app.use(session({
    secret: "suyash",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


app.get('/', (req, res) => {
    if(req.user)
        req.user.name = (req.user.name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    res.render('index.ejs', {user: req.user});
})

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

app.get('/checkcart', (req, res) => {
    if(typeof req.user == 'undefined')
    {
        console.log('true');
        res.send({message: "Please Login"});
    }
    else{
        const r_id = req.query.r_id;
        getRestIdFromCart(req.user.email, (response) => {
            if(response === undefined) {
                res.send({message: 'DB error'});
            }
            if(response.length == 0 || response[0].r_id == r_id){
                res.send({message: 'Same Restaurant'});
            }
            else
            {
                res.send({message: 'Different Restaurant'});
            }
        })
    }
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
                clearFlag: req.body.clearFlag
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

app.get('/dishes', checkAuthenticated, (req, res) => {
    res.render('./Restaurants/RestaurantDishes.ejs', {user: req.user});
})

app.get('/alldishes/:id', (req, res) => {
    allDishes(req.params.id, (response) => {
        res.json(response);
    })
})

app.get('/adddish', checkAuthenticated, (req, res) => {
    if(req.user.type === 'restaurant')
        res.render('./Restaurants/AddDish.ejs', {message: ''});
    else
        res.redirect('/');
})

app.post('/adddish', uploadRestaurant.single('dimage'), (req, res) => {
    const data = {
        rest_id: req.user.id,
        d_name: (req.body.dname).toLowerCase(),
        d_cost: req.body.dcost,
        d_type: req.body.dpreference,
        d_image: (req.file !== undefined) ? ((req.file.path.replace('views\\','')).replace('\\', '/')).replace('\\','/') : '',
    }
    addDish(data, (message) => {
        res.render('./Restaurants/AddDish.ejs', message);
    })
})

app.get('/updatedish', checkAuthenticated, (req, res) => {
    getDish(req.query.dish, (results) => {
        results.d_name = (results.d_name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        res.render('./Restaurants/update.ejs', {results});
    })
})

app.post('/updatedish', uploadRestaurant.single('dimage'), (req, res) => {
    const data = {
        d_id: req.query.dish,
        d_name: (req.body.dname).toLowerCase(),
        d_cost: req.body.dcost,
        d_type: req.body.dpreference,
        d_image: (req.file !== undefined) ? ((req.file.path.replace('views\\','')).replace('\\', '/')).replace('\\','/') : '',
    }
    updateDish(data, (message) => {
        res.redirect('/updatedish?dish=' + req.query.dish);
    })
})

app.get('/deletedish', (req, res) => {
    deleteDish(req.query.dish, (message) => {
        res.redirect('/dishes');
    })
})

app.get('/orders', checkAuthenticated, (req, res) => {
    if(req.user.type === 'restaurant')
        res.render('./Restaurants/RestaurantOrders.ejs');
    else
    {
        res.render('./Customer/CustomerOrders.ejs');
    }
})

app.get('/allorders', (req, res) => {
    if(req.user.type === 'restaurant')
    {
        getAllOrders(req.user.id, 'restaurant', (message) => {
            res.json(message);
        })
    }
    else
    {
        getAllOrders(req.user.email, 'customer', (message) => {
            res.json(message);
        })
    }
})

app.get('/profile', checkAuthenticated, (req, res) => {
    let flag = (req.query.flag != undefined)?req.query.flag : '';
    if(flag !== '')
        flag = (flag === 'true') ? 'Success' : 'Failure'
    if(req.user.type === 'restaurant')
    {
        getUserDetails(req.user.email, "restaurant", (profile) => {
            res.render('./Restaurants/RestaurantProfile.ejs', {user: profile, message: flag})
        })
    }
    else
    {
        getUserDetails(req.user.email, "customer", (profile) => {
            console.log(profile);
            res.render('./Customer/CustomerProfile.ejs', {user: profile, message: flag});
        })
    }
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
        if(message.message == true)
            res.redirect('/profile?flag=true');
        else
            res.redirect('/profile?flag=false');    
    })
})

app.post('/rprofile', uploadRestaurant.single('rimage'), (req, res) => {
    const data = {
        r_email: req.body.remail,
        r_name: (req.body.rname).toLowerCase(),
        r_address: req.body.raddress,
        r_image:(req.file !== undefined) ? ((req.file.path.replace('views\\','')).replace('\\', '/')).replace('\\','/') : '',
        r_latitude: req.body.rlatitude,
        r_longitude: req.body.rlongitude,
    }
    updateProfile(data, "restaurant", (message) => {
        res.redirect('/profile?flag=true');
    })
})


app.get('/changepassword', checkAuthenticated, (req, res) => {
    if(req.user.type === 'restaurant')
        res.render('./Restaurants/RestaurantChangePass.ejs', {user: req.user})
    else
    {
        res.render('./Customer/CustomerChangePass.ejs', {user: req.user});
    }

})

app.post('/changepassword', (req, res) => {
    const type = req.user.type;
    if(type === undefined)
    {
        req.json({message: "failure"});
    }
    bcrypt.hash(req.body.newpassword, 10, function(err, npassword){
        if(err){
        }
        const data = {
            type: type,
            email: req.body.email,
            opassword: req.body.oldpassword,
            npassword: npassword,
        }
        updatePassword(data, (response) => {
            res.json(response);
        })
    })
})

app.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

app.get('/getalldishes', (req, res) => {
    getAllDishes((result) => {
        res.json(result);
    })
})

app.get('/getallrestaurants', (req, res) => {
    getAllRestaurants((result) => {
        res.json(result);
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

app.get('/restaurantlogin', checkNotAuthenticated, (req, res) => {
    const message = (req.flash().error) || '';
    res.render("./Restaurants/RestaurantLogin.ejs", {message});
})

app.post('/restaurantlogin', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/restaurantlogin',
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
            sendWelcomeEmail(data.email, data.name);
        })
    })
})

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
            city: req.body.rcity.toLowerCase(),    
        }
        addRestaurant(data, (message) => {
            res.render("./Restaurants/RestaurantRegistration.ejs",{
                "message": 1
            })
            sendWelcomeEmail(data.email, data.name);
        })
    })
})

app.post("/create-checkout-session", checkAuthenticated, async (req, res) => {
    try {
        console.log(req.user);
        var data = req.body.data;
        data.email = req.user.email;
        data.name = req.user.name;
        console.log(data);
      const session = await stripe.checkout.sessions.create({
        metadata: {data: JSON.stringify(data)},
        payment_method_types: ["card"],
        mode: "payment",
        line_items: data.items.map(item => {
          return {
            price_data: {
              currency: "inr",
              product_data: {
                name: (item.d_name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
              },
              unit_amount: item.d_cost * 100,
            },
            quantity: item.quantity,
          }
        }),
        success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/cancel.html`
      })
    res.json({url: session.url});
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
})

app.get("/success", (req, res, next) => { if(req.query.session_id != '' && (req.query.session_id != null)) next(); else res.redirect('/')}, async (req, res) => {

    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    console.log(session);

    var data = JSON.parse(session.metadata.data);
    data.email = session.customer_details.email;
    data.name = session.customer_details.name;
    console.log(data);
    addOrder(data, (response) => {
        if(response.message === 'Success'){
            removeCart(data.email, (message) => {
                data.o_id = response.oid;
                createInvoice(data);
                res.render("success.ejs", {oid: response.oid});
            })
        }
    })
})

app.get("/forgot-password", (req, res) => {
    res.render("forgotPassword.ejs", {message: ''});
})

app.post("/forgot-password", (req, res) => {
    try {
        getUserDetails(req.body.email, (req.body.type).toLowerCase(), (user) => {
            if(user == null)
            {
                return res.render("forgotPassword.ejs", {message: 'Not exist'})
            }
            const token = jwt.sign({ email: user.email, type: (req.body.type).toLowerCase() }, 'forgot-password', {expiresIn: '15 min'})
            const link = `http://localhost:3000/reset-password/${token}`
            sendForgotPasswordLink(user.email, user.name, link);
            res.render("forgotPassword.ejs", {message: 'Success'})
        })
    }
    catch(e) {
        res.render("forgotPassword.ejs", {message: "Internal error"})
    }
})

app.get("/reset-password/:token", checkToken, (req, res) => {
    res.render("resetPassword.ejs", {message: ''});
})

app.post("/reset-password/:token", checkToken, (req, res) => {
    try {
        const data = jwt.decode(req.params.token)
        console.log(data);
        bcrypt.hash(req.body.password, 10, function(err, npassword) {
            if(err){
                callback({message: "failure"});
            }
            const changedData = {
                type: data.type,
                email: data.email,
                npassword: npassword
            }
            resetPassword(changedData, (data) => {
                if(data.message == 'success')
                {
                    return res.render("resetPassword.ejs", {message: 'Success'});
                }
                res.render("resetPassword.ejs", {message: 'Internal error'});
            })
        })
    } catch(e) {
        res.render("linkExpired.ejs");
    }
})

app.get('/restaurant/:r_id', (req, res) => {
    const r_id = req.params.r_id;
    getRestaurant(r_id, (restaurant) => {
        if(restaurant !== null) {
            restaurant[0].r_name = (restaurant[0].r_name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            return res.render("./Restaurants/searchRestaurant.ejs", {user: req.user, restaurant: restaurant[0]})
        }
        res.render("pageNotFound.ejs", {user: req.user});
    })
})

app.post('/restaurant/:r_id', (req, res) => {
    const r_id = req.params.r_id;
    const c_id = req.user.id;
    var data = req.body;
    if(req.user.type === 'customer') {
        if(req.body.type == 'restaurant') {
            data.rest_id = r_id
            data.c_id = c_id
            addRestReview(data, (response) => {
                return res.send(response);
            })
        }
        else
        {
            data.rest_id = r_id;
            console.log(r_id);
            addDishReview(data, (response) => {
                return res.send(response);
            })
        }
    }
    else
    {
        res.send({"message": "Login as customer to add reviews!"});
    }
})

app.get("/oauth", (req, res, next) => {
    if(req.isAuthenticated())
    {
        return next();
    }
    res.send({ message: "Failure"});
}, (req, res) => {
    res.send({ message: "Success"});
})

app.get('/:city', (req, res) => {
    const servingCities = ["lucknow", "delhi"];
    const city = req.params.city;
    if(servingCities.includes(city.toLowerCase()))
    {
        return res.render("./Restaurants/showRestaurantsonCriteria.ejs", {user: req.user});
    }
    res.render("pageNotFound.ejs", {user: req.user});
})

app.get("/search/autoSuggest", (req, res) => {
    const data = {
        name : req.query.q.toLowerCase(),
        city : req.query.city.toLowerCase()
    }
    try {
        searchDishes(data, (dishes) => {
            dishes.forEach(dish => {
                dish.type = 'dish';
            })
            searchRestaurants(data, (restaurants) => {
                restaurants.forEach(restaurant => {
                    restaurants.type = 'restaurant';
                })
                res.send([...dishes, ...restaurants])
            })
        })
    }
    catch(e) {
        res.send([])
    }
})


app.get("/search/restaurant", (req, res) => {
    const d_name = req.query.d_name.toLowerCase();
    const city = req.query.city.toLowerCase();
    try {
        getRestaurantwithFilter({d_name, city}, (response) => {
            res.send(response);
        })
    }
    catch(e) {
        res.send([])
    }
})


app.get("/reviews/:id", (req, res) => {
    const r_id = req.params.id;
    getReviews(r_id, (result) => {
        res.send(result);
    })
})

app.post("/order/updatestatus", (req, res) => {
    const od_id = req.query.od_id;
    const status = (req.query.confirm != null) ? req.query.confirm : req.query.status;
    console.log(status);
    confirmOrder(od_id, status, (response) => {
        if(response.message == 'Success') {
            if(status == 'No' || status == 'Canceled') {
                orderCancelled(response.data.c_email, od_id, response.data.c_name, response.r_id);
            }
            else {
                if(status == 'Delievered') {
                    orderDelievered(response.data.c_email, response.data.c_name, od_id, response.r_id);
                }
            }
            res.send(response);
        }
        else {
            res.send(response);
        }
    })
})

app.get("/order/:orderid", (req, res) => {
    const o_id = req.params.orderid;
    getOrderDetails(o_id, (data) => {
        if(req.user == undefined || data.length == 0 || data[0].c_email != req.user.email)
        {
            return res.redirect('/');
        }
        console.log(data.length);
        res.render("./Customer/CustomerOrderDetails.ejs", {data});
    })
})

function checkToken(req, res, next) {
    try {
        const decoded = jwt.verify(req.params.token, 'forgot-password')
        if(decoded) {
            next();
        }
    }
    catch(e) {
        res.render("linkExpired.ejs");
    }
}

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

function selectMulter(req){
    if(req.user.type === 'customer')
    {
        uploadCustomer.single('image');
    }
    uploadRestaurant.single('image');
}

app.listen(port);