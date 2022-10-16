const multer = require('multer');

const initializePassport = require('./passport-config');

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
        d_name: req.body.dname,
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
        res.render('./Restaurants/update.ejs', {results});
    })
})

app.post('/updatedish', uploadRestaurant.single('dimage'), (req, res) => {
    const data = {
        d_id: req.query.dish,
        d_name: req.body.dname,
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

app.get('/getalldishes', (req, res) => {
    getAllDishes((result) => {
        res.json(result);
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