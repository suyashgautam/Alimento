// getting all required elements
const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");
const icon = searchWrapper.querySelector(".icon");
let linkTag = searchWrapper.querySelector("a");
let webLink;

// if user press any key and release

inputBox.onkeyup = (e)=>{
    let userData = e.target.value; //user enetered data
    let city = document.querySelector('#location');
    console.log(city.value);
    let emptyArray = [];
    if(userData){
        fetch('/search/autoSuggest?q='+userData+"&city="+city.value).then(response => response.json()).then(responses => {
               
            emptyArray = responses.map((response)=>{
                if(response.type == 'dish')
                {
                    const d_name = (response.d_name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
                    return data = `<li> <div class="card suggest">
                    <a href="/${city.value}?d_name=${response.d_name}">
                    <div class="card-horizontal">
                        <div class="img-square-wrapper">
                            <img style = "border-radius: 5px; height: 100px; width: 100px;" class="" src="${(response.d_image == "")?"./image-not-available.jpg":'../' + response.d_image}" alt="Card image cap">
                        </div>
                        <div class="card-body">
                            <p class=""><strong>${d_name}</strong></p>
                            <p class="card-text">Dish</p>
                        </div>
                    </div> </a> </li>`;
                }
                else
                {
                    const r_name = (response.r_name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
                    return data = `<li> <div class="card suggest">
                    <a href="/restaurant/${response.rest_id}">
                    <div class="card-horizontal">
                        <div class="img-square-wrapper">
                            <img style = "border-radius: 5px; height: 100px; width: 100px;" class="" src="${(response.r_image == "")?"./image-not-available.jpg":'../' + response.r_image}" alt="Card image cap">
                        </div>
                        <div class="card-body-restaurant">
                            <p class="card-title"><strong>${r_name}</strong></p>
                            <p class="card-text">${response.r_address}</p>
                            <span style = "color: rgb(239, 79, 95)" class="card-text">Order now <i class="fa fa-angle-right" aria-hidden="true"></i></span>
                        </div>
                    </div> </a> </li>`;
                }
            });
            searchWrapper.classList.add("active"); //show autocomplete box
            showSuggestions(emptyArray);
            let allList = suggBox.querySelectorAll("li");                 
        })

    }else{
        searchWrapper.classList.remove("active"); //hide autocomplete box
    }
}

function select(element){
    let selectData = element.textContent;
    inputBox.value = selectData;
    icon.onclick = ()=>{
        webLink = "https://www.google.com/search?q=" + selectData;
        linkTag.setAttribute("href", webLink);
        linkTag.click();
    }
    searchWrapper.classList.remove("active");
}

function showSuggestions(list){
    let listData;
    if(!list.length){
        userValue = inputBox.value;
        listData = '<li>'+ userValue +'</li>';
    }else{
        listData = list.join('');
    }
    suggBox.innerHTML = listData;
}
