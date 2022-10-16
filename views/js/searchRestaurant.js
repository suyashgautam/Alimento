const orderselected = document.querySelector('.order-tab');
const overviewselected = document.querySelector('.overview-tab');
const reviewselected = document.querySelector('.review-tab');
const allDishes = document.querySelector('.overview-dishes-reviews');
const overview = document.querySelector('.overview');
const restTab = document.querySelector('.rest-tab');
const dishTab = document.querySelector('.dish-tab');

console.log(restTab, dishTab);

const restReview = document.querySelector('.rest-review');
const dishReview = document.querySelector('.dish-review');

const addRestReview = document.querySelector('#addRestReview');
const addDishReview = document.querySelector('#addRestReview');
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
function checkAuth(){ 
    fetch('/oauth').then(response => response.json()).then(response => {
        if(response.message == 'Success')
            return $("#myReviewModal").modal('toggle');
        alert("Kindly login as a customer to add review!");
        $("#myLoginModal").modal('toggle');
    })
    //$("#myReviewModal").modal('toggle'); //see here usage
};
orderselected.addEventListener('click', () => {
    const urlSplit = ((window.location.href).split('/'));
    const id = urlSplit[urlSplit.length - 1]
    var combinedDishes = '';
    fetch('alldishes/' + id).then(response => response.json()).then(response => {
        response.forEach(dish => {
            const starPercentage = (dish.rating / 5) * 100;

            const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
            const d_name = (dish.name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            combinedDishes += `<div class="card-horizontal">
                <div class="img-square-wrapper">
                    <img style = "border-radius: 5px; height: 125px; width: 125px;" class="" src="${dish.image}" alt="Card image cap">
                </div>
                <div class="card-body">
                <span style="float:right;"><button onclick = "addToCart('${dish.d_id}', '${dish.name}', '${dish.cost}', '${dish.rest_id}')" name="Add_To_Cart" class="btn btn-info">Add to Cart</button></span>
                    <p class="card-title"><strong>${d_name}</strong></p>
                    <div class="stars-outer">
                        <div class="stars-inner" style="width: ${starPercentageRounded}"></div>
                    </div>
                    <span class="number-rating">${dish.totalReviews} reviews</span>
                    <p class="card-text mt-auto">&#x20b9; ${dish.cost}</p>

                </div>
            </div>` 
        });
        if(combinedDishes == ''){
            combinedDishes = '<h3><strong>No dishes present currently.</strong></h3>'
        }
        allDishes.innerHTML = combinedDishes;
    })
    overview.classList.add('d-none');
    orderselected.classList.add('tab-active');
    overviewselected.classList.remove('tab-active');
    reviewselected.classList.remove('tab-active');
})

overviewselected.addEventListener('click', () => {
    allDishes.innerHTML = ''
    overview.classList.remove('d-none');
    overviewselected.classList.add('tab-active');
    reviewselected.classList.remove('tab-active');
    orderselected.classList.remove('tab-active');
})

reviewselected.addEventListener('click', () => {
    const path = window.location.pathname.split('/')
    const r_id = path[path.length - 1];
    var allReviews = ''
    fetch('/reviews/'+r_id).then(response => response.json()).then(response => {
        response.forEach(review => {
            let stars = ''
            for (let index = 1; index <= 5; index++) {
                if(index <= review.stars)
                    stars += '<span class="fa fa-star star-active"></span>'
                else
                    stars += '<span class="fa fa-star star-inactive"></span>'
            }
            var readable_date = new Date(review.created_at).toDateString();
            allReviews += `<div class="card-review">
            <div class="row d-flex">
                <div class=""> <img class="profile-pic" src="${(review.c_image != '') ? review.c_image : "image-not-available.jpg"}"> </div>
                <div class="d-flex flex-column">
                    <h4 class="mt-2 mb-0">${review.c_name}</h4>
                    <div>
                        <p class="text-left">${stars}</p>
                    </div>
                </div>
                <div class="ml-auto">
                    <p class="text-muted pt-5 pt-sm-3">${readable_date}</p>
                </div>
            </div>
            <div class="row">
                <div style="width:120px"></div>
                <div class="content">${review.review}</div>
            </div>
        </div>`
        })
        if(allReviews == ''){
            allReviews = '<h3 class="text-center"><strong>No reviews.</strong></h3>'
        }
        allDishes.innerHTML = allReviews;
    })
    overview.classList.add('d-none');
    reviewselected.classList.add('tab-active');
    orderselected.classList.remove('tab-active');
    overviewselected.classList.remove('tab-active');
})

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
                    createAlert('Dish already present in Cart.','','You cannot add a dish to cart which is already present. Try adding any other dish.','info',false,true,'pageMessages');
                    //alert('Dish already present in Cart');
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
                            createAlert('','Dish added successfully','Dish has been added successfully to cart. Checkout out other dishes.','success',true,true,'pageMessages');
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
                //alert('Some issue occured. Please try again later!');
                createAlert('Opps!','Something went wrong! Please try again later.','','danger',true,false,'pageMessages');
            } 
        }
    }
    })

}


dishTab.addEventListener('click', () => {
    console.log('dishTab');
    dishTab.classList.add('tab-active');
    restTab.classList.remove('tab-active');
    restReview.classList.add('d-none');
    dishReview.classList.remove('d-none');
    const pathName = window.location.pathname.split('/')
    const restId = pathName[pathName.length - 1];
    const dishReviewList = document.querySelector('#dish-review-list');
    let allDishes = ''
    fetch('/alldishes/' + restId).then(response => response.json()).then(response => {
        console.log(response);
        response.forEach(dish => {
            const d_name = (dish.name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            allDishes += `<option value="${dish.name}">${d_name}</option>`
        })
        dishReviewList.innerHTML = allDishes;
    })

})

restTab.addEventListener('click', () => {
    console.log('restTab');
    restTab.classList.add('tab-active')
    dishTab.classList.remove('tab-active')
    dishReview.classList.add('d-none');
    restReview.classList.remove('d-none');
})
