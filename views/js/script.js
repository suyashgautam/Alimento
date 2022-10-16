var dishes = document.querySelectorAll(".inddishes");
var showDishes = document.querySelector(".allDishes");
var All = document.querySelector('.All');
var allRestaurants = document.querySelector('.restaurants');
var allCities = document.querySelector('.cities')

function createAlert(title, summary, details, severity, dismissible, autoDismiss, appendToId) {
var iconMap = {
    info: "fa fa-info-circle",
    success: "fa fa-thumbs-up",
    warning: "fa fa-exclamation-triangle",
    danger: "fa ffa fa-exclamation-circle"
};

var iconAdded = false;

var alertClasses = ["alert", "animated", "flipInX"];
alertClasses.push("alert-" + severity.toLowerCase());

if (dismissible) {
    alertClasses.push("alert-dismissible");
}

var msgIcon = $("<i />", {
    "class": iconMap[severity] // you need to quote "class" since it's a reserved keyword
});

var msg = $("<div />", {
    "class": alertClasses.join(" ") // you need to quote "class" since it's a reserved keyword
});

if (title) {
    var msgTitle = $("<h4 />", {
    html: title
    }).appendTo(msg);
    
    if(!iconAdded){
    msgTitle.prepend(msgIcon);
    iconAdded = true;
    }
}

if (summary) {
    var msgSummary = $("<strong />", {
    html: summary
    }).appendTo(msg);
    
    if(!iconAdded){
    msgSummary.prepend(msgIcon);
    iconAdded = true;
    }
}

if (details) {
    var msgDetails = $("<p />", {
    html: details
    }).appendTo(msg);
    
    if(!iconAdded){
    msgDetails.prepend(msgIcon);
    iconAdded = true;
    }
}


if (dismissible) {
    var msgClose = $("<span />", {
    "class": "close", // you need to quote "class" since it's a reserved keyword
    "data-dismiss": "alert",
    html: "<i class='fa fa-times-circle'></i>"
    }).appendTo(msg);
}

$('#' + appendToId).prepend(msg);

if(autoDismiss){
    setTimeout(function(){
    msg.addClass("flipOutX");
    setTimeout(function(){
        msg.remove();
    },1000);
    }, 5000);
}
}



window.addEventListener('load', (e) => {
    async function getData(url) {
        const response = await fetch(url)
        return response.json();
    }

    getData('/getallrestaurants').then(getAllRestaurants => {
        console.log(getAllRestaurants);
        const cities = [...new Set(getAllRestaurants.map(item => item.r_city))];
        var allr = "";
        var allc = "";
        cities.forEach((city, ind) => {
            allc += `<a href="/${city}">
            <div style="margin: 5px; background-color: #d3d3d3; height: auto; width:110px; border-radius: 5px; align-items: center;" class="card-horizontal">
                <div style="margin: auto;" style="text-align: center;" class="card-body-restaurant">
                    <p style="margin: auto; text-transform:capitalize " class="card-title"><strong>${city}</strong></p>
                </div>
            </div> 
        </a>`
        })
        allCities.innerHTML = allc;
        console.log(allCities);
        var totalRest = getAllRestaurants.length - 1;
        getAllRestaurants.forEach((rest, ind) => {
            const r_name = (rest.r_name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            const leftarr = `<section id='section${(ind/5) + 1}'>
            <a href='#section${((ind/5) + 1) == 1 ? 1 : (ind/5)}' class='arrow__btn'>‹</a>`;
            const rightarr = `<a href='#section${Math.floor(ind/5) + 2}' class='arrow__btn'>›</a>
            </section>`
            const newr = `<div class="item card">
            <!-- <div style="border-radius:10px;" class="card"> -->
            <img src="${(rest.r_image != "") ? (rest.r_image) : "./image-not-available.jpg"}" alt="" class="card-img-top" height="250" width="300">
            <div class="card-body text-center">
                <h5 class="card-title"><strong>${r_name}</strong></h5>
                <p class="card-text">Address: ${rest.r_address}</p>
                <form method="POST" onsubmit="event.preventDefault(); findDishes(${rest.rest_id})">
                    <button type="submit" name="All_Dishes" class="btn btn-default">All Dishes</button>
                    <input type="hidden" name="rest_id" id="${rest.rest_id}" value="${rest.rest_id}">
                </form>
            </div>
        </div>`
            if(ind % 5 == 0)
            {
                allr = allr + leftarr + newr;
            }
            else
            {
                if(ind % 5 == 4)
                {
                    allr = allr + newr + rightarr;
                }
                else
                {
                    allr = allr + newr;
                }
            }
        })

        while(totalRest % 5 != 4)
        {
            const newr = `<div class='item card'>
            <img src='./cs.jpg' alt='' class='card-img-top' height='250' width='100'>
            <div class='card-body text-center'>
                <h5 class='card-title'>Coming Soon</h5>
                <p class='card-text'>Address: </p>
                    <button type='submit' name='#' class='btn btn-default'>All Dishes</button>
                    <input type='hidden' name='rest_id' value=''>
                </div>
            </div>`
            allr = allr + newr;
            totalRest += 1;
        }
        const rightarr = `<a href='#section1' class='arrow__btn'>›</a></section>`;
        allr = allr + rightarr;
        allRestaurants.innerHTML = allr;

        getData('/getalldishes').then(getAllDishes => {
            var alld = "";
            
            getAllDishes.forEach(dish => {
                const starPercentage = (dish.d_rating / 5) * 100;

                const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
                const d_name = (dish.d_name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
                const r_name = (dish.r_name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
                const newd = `<div class="col-lg-3 mb-5 inddishes" id = "${dish.d_type + ' ' + dish.rest_id}">
                <div class="card">
                    <img src="${(dish.d_image == "")?"./image-not-available.jpg":dish.d_image}" height="150" width="100%" alt="" class="card-img-top">
                        <div class="card-body text-center">
                            <h5 class="card-title"><strong>${d_name}</strong></h5>
                            <p class="card-text"><strong><em>Price:</em></strong> Rs. ${dish.d_cost}</p>
                            <p class="card-text"><strong><em>Type: </em></strong>${dish.d_type}</p>
                            <p class="card-text"><strong><em>Restaurant:</em></strong> ${r_name}</p>

                            <div class="stars-outer">
                            <div class="stars-inner" style="width: ${starPercentageRounded}"></div>
                            </div>
                          <span class="number-rating">${dish.d_totalReviews} reviews</span>
                            <button onclick = "addToCart('${dish.d_id}', '${dish.d_name}', '${dish.d_cost}', '${dish.rest_id}')" name="Add_To_Cart" class="btn btn-info">Add to Cart</button>
                        </div>
                    </div>
                </div>`;
                alld = alld + newd;
            })
            showDishes.innerHTML = alld;
            dishes = document.querySelectorAll(".inddishes");
            showDishes = document.querySelector(".allDishes");
            All = document.querySelector('.All');
        })
    })
});

const addToCart = (d_id, d_name, d_cost, rest_id) => {
    const data = {
        d_id,
        d_name,
        d_cost,
        rest_id,
    }
    fetch('/checkcart?r_id='+rest_id, {method: "GET"}).then(response => response.json()).then(response => {
        console.log(response);
        if(response.message === 'Please Login'){
            alert('Please Login as a Customer !!');
            window.location.replace("/customerlogin");
        }
        else {
        if(response.message == 'Same Restaurant') {
            data.clearFlag = false;
            fetch('/cart', {method: "POST", body: JSON.stringify(data), 
            headers: {
                'Content-Type':'application/json',
                'Accept':'application/json'
            },}).then(response => response.json()).then(response => {
                console.log(response.message);
                if(response.message === 'Present'){
                    // alert('Dish already present in Cart');
                    createAlert('Dish already present in Cart.','','You cannot add a dish to cart which is already present. Try adding any other dish.','info',false,true,'pageMessages');
                }
                else
                {
                    if(response.message === 'Please Login'){
                        alert('Please Login as a Customer !!');
                        window.location.replace("/customerlogin");
                    }
                    else
                    {
                        if(response.message === 'Not Allowed'){
                            window.location.replace("/profile");
                        }
                        else
                        {
                            // alert('Dish added to the cart');
                            createAlert('','Dish added successfully','Dish has been added successfully to cart. Checkout out other dishes.','success',true,true,'pageMessages');
                        }
                    }
                }
            })
        }
        else {
            if(response.message == 'Different Restaurant') {
                if (confirm("You have items in your cart from another restaurant. Do you want to discard previous cart and create a new cart?") == true) {
                    data.clearFlag = true;
                    fetch('/cart', {method: "POST", body: JSON.stringify(data), 
                    headers: {
                        'Content-Type':'application/json',
                        'Accept':'application/json'
                    },}).then(response => response.json()).then(response => {
                        console.log(response.message);
                        if(response.message === 'Present'){
                            //alert('Dish already present in Cart');
                            createAlert('Dish already present in Cart.','','You cannot add a dish to cart which is already present. Try adding any other dish.','info',false,true,'pageMessages');
                        }
                        else
                        {
                            if(response.message === 'Please Login'){
                                alert('Please Login as a Customer !!');
                                window.location.replace("/customerlogin");
                            }
                            else
                            {
                                if(response.message === 'Not Allowed'){
                                    window.location.replace("/profile");
                                }
                                else
                                {
                                    //alert('Dish added to the cart');
                                    createAlert('','Dish added successfully','Dish has been added successfully to cart. Checkout out other dishes.','success',true,true,'pageMessages');
                                }
                            }
                        }
                    })    
                }
                else {
                
                } 
            }
            else {
                // alert('Some issue occured. Please try again later!');
                createAlert('Opps!','Something went wrong! Please try again later.','','danger',true,false,'pageMessages');
            } 
        }
    }
    })

}

const findDishes = (restid) =>
{
    var alld = "";
    dishes.forEach(dish => {
        if(dish.id.split(" ").pop() == restid)
        {
            alld = alld + dish.outerHTML
        }
    })
    showDishes.innerHTML = alld;
}

All.addEventListener('click', (e) => {
    var alld = "";
    dishes.forEach(dish => {
        alld = alld + dish.outerHTML
    })
    showDishes.innerHTML = alld;
    e.preventDefault();
})
