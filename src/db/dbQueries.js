var mysql = require('mysql')
const bcrypt = require('bcrypt');
const uuid = require('uuid');

var connection = mysql.createConnection({
    host: 'localhost',
    user : 'root',
    password: '',
    database: 'alimento_db'
});

connection.connect();

const getAllDishes = (callback) => {
    try {
        connection.query(`SELECT dishes_tb.d_id,
        dishes_tb.rest_id,
        dishes_tb.d_name,
        dishes_tb.d_cost,
        dishes_tb.d_type,
        dishes_tb.d_image,
        dishes_tb.d_totalRatings,
        dishes_tb.d_totalCustomers,
        restaurantlogin_tb.r_name
        FROM dishes_tb
        LEFT JOIN restaurantlogin_tb
        ON dishes_tb.rest_id = restaurantlogin_tb.rest_id`, (error, results, fields) => {
            if(error) {
                callback(error)
            }
            const result = []
            results.forEach(dish => {
                result.push({
                    d_id : dish.d_id,
                    rest_id : dish.rest_id,
                    r_name : dish.r_name,
                    d_name : dish.d_name,
                    d_cost : dish.d_cost,
                    d_type : dish.d_type,
                    d_image : dish.d_image,
                    d_rating : dish.d_totalCustomers !== 0 ? parseFloat((dish.d_totalRatings * 5)/(dish.d_totalCustomers * 5)) : 0,
                    d_totalReviews: dish.d_totalCustomers
                })
            });
            callback(result);
        })
    }
    catch(e) {
        callback(e);
    }
}

const getAllRestaurants = (callback) => {
    try {
        connection.query('SELECT rest_id, r_image, r_name, r_address, r_city from restaurantlogin_tb', (error, results, fields) => {
            if(error) {
                callback(error)
            }
            callback(results);
        })
    }
    catch(e) {
        callback(e);
    }
}

const addCustomer = (data, callback) => {
    try {
        const sql = `INSERT INTO customerlogin_tb(\`c_name\`, \`c_phone\`, \`c_preference\`, \`c_address\`, \`c_email\`, \`c_password\`, \`c_image\`) VALUES('${data.name}', '${data.phone}', '${data.preference}', '${data.address}', '${data.email}', '${data.password}', '${data.image}')`;
        connection.query(sql, (error, results, fields) => {
            if(error) {
                callback(error)
            }
            callback(results);
        })
    }
    catch(e){
        callback(e);
    }
}
const addRestaurant = (data, callback) => {
    try {
        const sql = `INSERT INTO restaurantlogin_tb(\`r_name\`, \`r_address\`, \`r_email\`, \`r_password\`, \`r_image\`, \`r_city\`) VALUES('${data.name}', '${data.address}', '${data.email}', '${data.password}', '${data.image}', '${data.city}')`;
        connection.query(sql, (error, results, fields) => {
            if(error) {
                callback(error)
            }
            callback(results);
        })
    }
    catch(e){
        callback(e);
    }
}

const getUserDetails = (username, flag, callback) => {
    try{
        if(flag === "customer"){
            const sql = `SELECT c_id, c_email, c_password, c_name, c_image, c_address, c_phone FROM customerlogin_tb WHERE c_email = '${username}' limit 1`
            connection.query(sql, (error, results, fields) => {
                if(error) {
                    callback(error)
                }
                if(results.length === 0)
                {
                    return callback(null);
                }
                else
                {
                    callback({id: results[0].c_id, name: results[0].c_name, email: results[0].c_email, password: results[0].c_password, image: (results[0].c_image !== '') ? results[0].c_image : "/image-not-available.jpg", type: "customer", address: results[0].c_address, phone: results[0].c_phone});
                }
            })
        }
        else
        {
            const sql = `SELECT rest_id, r_email, r_password, r_name, r_image, r_address, r_latitude, r_longitude FROM restaurantlogin_tb WHERE r_email = '${username}' limit 1`
            connection.query(sql, (error, results, fields) => {
                if(error) {
                    callback(error)
                }
                if(results.length === 0)
                {
                    return callback(null);
                }
                return callback({id: results[0].rest_id, name: results[0].r_name, email: results[0].r_email, password: results[0].r_password, image: (results[0].r_image !== '') ? results[0].r_image : "/image-not-available.jpg", address: results[0].r_address , latitude: results[0].r_latitude, longitude: results[0].r_longitude, type: "restaurant"});
            })
        }
    }
    catch(e){
        callback(e);
    }
}

const updatePassword = (data, callback) => {
    if(data.type == 'restaurant')
    {
        const sql = `SELECT r_password from restaurantlogin_tb where r_email = '${data.email}'`;
        connection.query(sql, (err, results, fields) => {
            if(bcrypt.compareSync(data.opassword, results[0].r_password))
            {
                const sql = `UPDATE restaurantlogin_tb SET r_password = '${data.npassword}' WHERE r_email = '${data.email}'`;
                connection.query(sql, (error, results, fields) => {
                    if(error) {
                        callback({message: "failure"})
                    }
                    if(results.changedRows > 0)
                    {
                        callback({message: "success"});
                    }
                    else
                    {
                        callback({message: "failure"});
                    }
                })
            }
            else
            {
                callback({message: "failure"});
            }
        })
    }
    else
    {
        const sql = `SELECT c_password from customerlogin_tb where c_email = '${data.email}'`;
        connection.query(sql, (err, results, fields) => {
            if(bcrypt.compareSync(data.opassword, results[0].c_password))
            {
                const sql = `UPDATE customerlogin_tb SET c_password = '${data.npassword}' WHERE c_email = '${data.email}'`;
                connection.query(sql, (error, results, fields) => {
                    if(error) {
                        callback(error)
                    }
                    if(results !== undefined && results.changedRows > 0)
                    {
                        callback({message: "success"});
                    }
                    else
                    {
                        callback({message: "failure"});
                    }
                })
            }
            else
            {
                console.log("Hello");
                callback({message: "failure"});
            }
        })
    }
}

const resetPassword = (data, callback) => {
    if(data.type == 'restaurant')
    {
        const sql = `UPDATE restaurantlogin_tb SET r_password = '${data.npassword}' WHERE r_email = '${data.email}'`;
        connection.query(sql, (error, results, fields) => {
            if(error) {
                callback({message: "failure"})
            }
            if(results.changedRows > 0)
            {
                callback({message: "success"});
            }
            else
            {
                callback({message: "failure"});
            }
        })
    }
    else
    {
        const sql = `UPDATE customerlogin_tb SET c_password = '${data.npassword}' WHERE c_email = '${data.email}'`;
        connection.query(sql, (error, results, fields) => {
            if(error) {
                callback(error)
            }
            if(results !== undefined && results.changedRows > 0)
            {
                callback({message: "success"});
            }
            else
            {
                callback({message: "failure"});
            }
        })
    }
}

const allDishes = (r_id, callback) => {
    const sql = `SELECT * FROM dishes_tb WHERE rest_id = '${r_id}'`
    connection.query(sql, (err, results, fields) => {
        if(err){
            callback(err);
        }
        var dishes = []
        results.forEach(element => {
            dishes.push({
                d_id: element.d_id,
                rest_id: element.rest_id,
                name: element.d_name,
                cost: element.d_cost,
                type: element.d_type,
                image: element.d_image,
                totalReviews: element.d_totalCustomers,
                rating: ((element.d_totalRatings * 5)/(element.d_totalCustomers * 5))
            })
        });
        callback(dishes);
    })
}

const getDish = (d_id, callback) => {
    const sql = `SELECT * FROM dishes_tb WHERE d_id = ${d_id}`;
    connection.query(sql, (err, results, fields) => {
        if(err){
            return callback(err)
        }
        callback({d_id: results[0].d_id, d_name: results[0].d_name, d_cost: results[0].d_cost, d_type: results[0].d_type, d_image: results[0].d_image});
    })
}

const addDish = (data, callback) => {
    if(data.d_image !== '')
    {
        sql = `INSERT INTO dishes_tb(rest_id, d_name, d_cost, d_type, d_image) VALUES 
        ('${data.rest_id}','${data.d_name}','${data.d_cost}','${data.d_type}','${data.d_image}')`;
    }
    else
    {
        sql = `INSERT INTO dishes_tb(rest_id, d_name, d_cost, d_type) VALUES 
        ('${data.rest_id}','${data.d_name}','${data.d_cost}','${data.d_type}')`;
    }
    connection.query(sql, (err, results, fields) => {
        if(err){
            callback({message: false});
        }
        callback({message: true});
    })
}

const updateDish = (data, callback) => {
    if(data.d_image !== '')
    {
        sql = `UPDATE dishes_tb SET d_name = '${data.d_name}', d_cost = '${data.d_cost}', d_type = '${data.d_type}', d_image = '${data.d_image}' WHERE d_id = ${data.d_id}`;
    }
    else
    {
        sql = `UPDATE dishes_tb SET d_name = '${data.d_name}', d_cost = '${data.d_cost}', d_type = '${data.d_type}' WHERE d_id = ${data.d_id}`;
    }
    connection.query(sql, (err, results, fields) => {
        if(err){
            callback(err);
        }
        callback({message: true});
    })
}

const deleteDish = (data, callback) => {
    const sql = `DELETE FROM dishes_tb WHERE d_id = ${data}`;
    connection.query(sql, (err, results, fields) => {
        if(err){
            return callback({message: false});
        }
        callback({message: true});
    })
}

const updateProfile = (data, flag, callback) => {
    if(flag === "customer"){
        if(data.c_image !== '')
        {
            sql = `UPDATE customerlogin_tb SET c_name = '${data.c_name}', c_address = '${data.c_address}', c_phone = '${data.c_phone}', c_image = '${data.c_image}' WHERE c_email = '${data.c_email}'`;
        }
        else
        {
            sql = `UPDATE customerlogin_tb SET c_name = '${data.c_name}', c_address = '${data.c_address}', c_phone = '${data.c_phone}' WHERE c_email = '${data.c_email}'`;
        }
    }
    else
    {
        if(data.r_image !== '')
        {
            sql = `UPDATE restaurantlogin_tb SET r_name = '${data.r_name}', r_address = '${data.r_address}', r_image = '${data.r_image}', r_latitude = '${data.r_latitude}', r_longitude = '${data.r_longitude}' WHERE r_email = '${data.r_email}'`;
        }
        else
        {
            sql = `UPDATE restaurantlogin_tb SET r_name = '${data.r_name}', r_address = '${data.r_address}', r_latitude = '${data.r_latitude}', r_longitude = '${data.r_longitude}' WHERE r_email = '${data.r_email}'`;
        }
    }
    console.log(sql);
    connection.query(sql, (err, results, fields) => {
        if(err){
            callback(err);
        }
        callback({message: true});
    })
}

const addToCartDB = (data, callback) => {
    if(data.clearFlag == true) {
        let sql1 = `DELETE FROM cart_tb WHERE c_email = '${data.c_email}'`;
        connection.query(sql1, (err, results, fields) => {
            if(err){
                callback({message: "Failure"});
            }
            const sql = `INSERT IGNORE INTO cart_tb(r_id, d_id, c_email, d_cost, d_name) VALUES ('${data.rest_id}', '${data.d_id}', '${data.c_email}', '${data.d_cost}', '${data.d_name}')`;
            connection.query(sql, (err, results, fields) => {
                if(err){
                    callback({message: "Failure"});
                }
                if(results && results.affectedRows > 0)
                {
                    callback({message: "Success"});
                }
                else
                {
                    callback({message: "Present"});
                }
            })
        })
    }
    else {
        const sql = `INSERT IGNORE INTO cart_tb(r_id, d_id, c_email, d_cost, d_name) VALUES ('${data.rest_id}', '${data.d_id}', '${data.c_email}', '${data.d_cost}', '${data.d_name}')`;
        connection.query(sql, (err, results, fields) => {
            if(err){
                callback({message: "Failure"});
            }
            if(results && results.affectedRows > 0)
            {
                callback({message: "Success"});
            }
            else
            {
                callback({message: "Present"});
            }
        })
    }
}

const getRestIdFromCart = (email, callback) => {
    const sql = `SELECT DISTINCT r_id from cart_tb WHERE c_email = '${email}'`;
    connection.query(sql, (err, results, fields) => {
        if(err){
            callback(undefined);
        }
        callback(results);
    })
}

const getCartDishes = (c_email, callback) => {
    const sql = `SELECT * FROM cart_tb WHERE c_email = '${c_email}'`;
    connection.query(sql, (err, results, fields) => {
        if(err) {
            callback({message: "Failure"});
        }
        callback(results);
    })
}

const updateCartQty = (data, callback) => {
    const sql = `UPDATE cart_tb SET cart_quantity = '${data.qty}' WHERE c_email = '${data.c_email}' and d_id = '${data.d_id}'`;
    connection.query(sql, (err, results, fields) => {
        if(err){
            callback({message: "Failure"});
        }
        callback({message: "Success"});
    })
}

const deleteFromCart = (data, callback) => {
    const sql = `DELETE FROM cart_tb WHERE c_email = '${data.email}' and d_id = '${data.d_id}'`;
    connection.query(sql, (err, results, fields) => {
        if(err){
            callback({message: "Failure"});
        }
        else
        {
            callback({message: "Success"});
        }
    })
}

const getAllOrders = (data, flag, callback) => {
    if(flag === 'restaurant')
    {
        const sql = `SELECT * FROM order_tb WHERE r_id = '${data}' ORDER BY o_datetime DESC`;
        connection.query(sql, (err, results, fields) => {
            if(err){
                return callback({message: 'Failure'});
            }
            return callback(results);
        })
    }
    else
    {
        const sql = `SELECT order_tb.*,restaurantlogin_tb.r_name, restaurantlogin_tb.r_address FROM order_tb INNER JOIN restaurantlogin_tb ON order_tb.r_id = restaurantlogin_tb.rest_id WHERE c_email = '${data}' ORDER BY o_datetime DESC;`;
        connection.query(sql, (err, results, fields) => {
            if(err) {
                return callback({message: 'Failure'});
            }
            return callback(results);
        })
    }

}

const addOrder = (data, callback) => {
    const sql = `SELECT * FROM cart_tb where c_email = '${data.email}'`;
    const oid = uuid.v1();
    connection.query(sql, (err, results, fields) => {
        if(err) {
            return callback({message: "Failed"});
        }
        else
        {
            results.forEach((element, index) => {
                const payment = element.cart_quantity * element.d_cost;
                const address = data.address.c_address + ', ' + data.address.c_city + ', ' + 
                                data.address.c_state + ', ' + data.address.c_country + ', ' + data.address.c_postalcode;
                const osql = `INSERT INTO order_tb(o_id, d_id, d_name, d_quantity, r_id, o_status, o_payment, c_email, c_address, c_latitude, c_longitude) VALUES 
                ('${oid}', '${element.d_id}', '${element.d_name}', '${element.cart_quantity}', '${element.r_id}', 'Order Confirmation', '${payment}', '${element.c_email}', '${address}', '${data.address.c_latitude}', '${data.address.c_longitude}')`;
                connection.query(osql, (err, results, fields) => {
                    if(err){
                        return callback({message: 'Failed'});
                    }
                })
            })
        }
        return callback({message: 'Success', oid});
    })
}

const removeCart = (email, callback) => {
    const sql = `DELETE FROM cart_tb WHERE c_email = '${email}'`;
    connection.query(sql, (err, results, fields) => {
        if(err){
            return callback({message: 'Failed'});
        }
        callback({message: 'Success'});
    })
}

const searchDishes = (data, callback) => {
    const sql = `SELECT d_name, d_id, d_image FROM dishes_tb WHERE d_name like '%${data.name}%' and rest_id in (SELECT rest_id from restaurantlogin_tb where r_city = '${data.city}') LIMIT 1;`
    connection.query(sql, (err, results, fields) => {
        if(err){
            return callback([]);
        }
        callback(results);
    })
}

const searchRestaurants = (data, callback) => {
    const sql = `SELECT r_name, rest_id, r_image, r_address FROM restaurantlogin_tb WHERE r_name LIKE '%${data.name}%' and r_city = '${data.city}';`
    connection.query(sql, (err, results, fields) => {
        if(err){
            return callback([]);
        }
        callback(results);
    })
}

const getRestaurant = (r_id, callback) => {
    const sql = `SELECT r_name, r_address, r_image, r_latitude, r_longitude FROM restaurantlogin_tb WHERE rest_id = ${r_id}`;
    connection.query(sql, (err, results, fields) => {
        if(err || results.length === 0){
            return callback(null);
        }
        
        callback(results);
    })
}

const getRestaurantwithFilter = (filter, callback) => {
    var sql = `SELECT rest_id, r_name, r_image, r_address from restaurantlogin_tb WHERE r_city = '${filter.city}' AND rest_id IN (SELECT rest_id FROM dishes_tb`;
    if(filter.d_name != null && filter.d_name != 'null' && filter.d_name != '')
    {
        sql = sql + ` WHERE d_name = '${filter.d_name}')`
    }
    else
    {
        sql = sql + `)`;
    }
    connection.query(sql, (err, results, fields) => {
        if(err || results.length === 0){
            return callback([]);
        }
        
        callback(results);
    })
}

const addRestReview = (data, callback) => {
    var sql = `INSERT INTO restaurantreview_tb (\`rest_id\`, \`c_id\`, \`review\`, \`stars\`) VALUES('${data.rest_id}', '${data.c_id}', '${data.review}', '${data.stars}')`
    connection.query(sql, (err, results, fields) => {
        if(err) {
            return callback({message: "Server error"});
        }
        sql = `UPDATE restaurantlogin_tb SET r_totalRatings = r_totalRatings + ${data.stars}, r_totalCustomers = r_totalCustomers + 1 WHERE rest_id = ${data.rest_id}`;
        connection.query(sql, (err, results, fields) => {
            if(err) {
                return callback({message: "Server error"});
            }
            return callback({message: 'Success'})
        })
    })
}

const addDishReview = (data, callback) => {
    var sql = `UPDATE dishes_tb SET d_totalRatings = d_totalRatings + ${data.stars}, d_totalCustomers = d_totalCustomers + 1 WHERE rest_id = ${data.rest_id} and d_name = '${data.d_name}'`
    connection.query(sql, (err, results, fields) => {
        if(err) {
            return callback({message: "Server error"});
        }
        return callback({message: 'Success'})
    })
}

const getReviews = (rest_id, callback) => {
    var sql = `SELECT t1.review, t1.stars, t1.created_at, t2.c_name, t2.c_image FROM restaurantreview_tb as t1 INNER JOIN customerlogin_tb as t2 ON (t1.c_id = t2.c_id) WHERE t1.rest_id = ${rest_id} ORDER BY t1.created_at DESC;`
    connection.query(sql, (err, results, fields) => {
        if(err) {
            return callback([]);
        }
        return callback(results);
    })
}

const confirmOrder = (od_id, status, callback) => {
    var sql = ``
    if(status == 'Yes' || status == 'No')
        sql = `UPDATE order_tb SET o_status = '${(status === 'Yes') ? 'Preparing food' : 'Canceled'}' where o_id = '${od_id}'`
    else
        sql = `UPDATE order_tb SET o_status = '${status}' where o_id = '${od_id}'`
    connection.query(sql, (err, results, fields) => {
        if(err) {
            return callback({message: "Failure"});
        }
        sql = `SELECT DISTINCT t1.c_email, t2.c_name, t1.r_id from order_tb as t1 LEFT JOIN customerlogin_tb as t2 ON t1.c_email = t2.c_email WHERE t1.o_id = '${od_id}'`;
        connection.query(sql, (err, results, fields) => {
            if(err) {
                return callback({message: "Failure"});
            }
            return callback({message: "Success", data: results[0]});
        })
    })
}

const getOrderDetails = (o_id, callback) => {
    var sql = `SELECT t4.*, t5.c_name FROM (SELECT t1.*, t2.r_name, t2.r_address, t2.r_image, t2.r_latitude, t2.r_longitude FROM order_tb as t1 LEFT JOIN restaurantlogin_tb as t2 ON t1.r_id = t2.rest_id WHERE o_id = '${o_id}') as t4 LEFT JOIN customerlogin_tb as t5 ON t4.c_email = t5.c_email;`;
    connection.query(sql, (err, results, fields) => {
        if(err) {
            return callback([]);
        }
        return callback(results);
    })
}

module.exports = {getAllDishes, getAllRestaurants, addCustomer, addRestaurant, getUserDetails, 
    updatePassword, resetPassword, updateProfile, allDishes, addDish, updateDish, deleteDish, getDish, addToCartDB, 
    getCartDishes, updateCartQty, deleteFromCart, addOrder, removeCart, getAllOrders, searchDishes, searchRestaurants, 
    getRestaurant, getRestaurantwithFilter, addRestReview, addDishReview, getReviews, confirmOrder, getOrderDetails, getRestIdFromCart};