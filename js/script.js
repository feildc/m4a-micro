const url = window.location;
const urlString = url.toString();
const baseUrl  = urlString.split('/')[0] + "//" + urlString.split('/')[2] + "/";
let pageUrl = (urlString.split('/')[3].split('?')[0]);
let currentPage;
const resultsUrl = "results.html"
const indexUrl = "index.html"

//INDEX VARIABLES
let zipCode = "";
let zipValid = false;
let checkButton;
let zipInput;
let zipButton;
let zipError;
let zipValue = "";
const params = new URLSearchParams(url.search); 
let count = 0;

window.onbeforeunload = function(){
    console.log("unload");
}; 
window.onload = function(){
    count += 1; 
    if(checkPageUrl() === "index"){
    //Everything for the homepage can below this
     zipInput = document.getElementById("zip-input");
     zipError = document.getElementById("zip-alert");
     zipButton = document.getElementById("zip-button");
     zipValue = zipInput.value;
     zipCheck();

    //check the zipcode each time it's updated
    zipInput.addEventListener('input', function (evt) {
        addZipDash();
        zipCheck();
        
    })

    }
    else if(checkPageUrl() === "results"){
    //Everything for the homepage can below this
    getZipFromUrl();

    

    }
    
    console.log(pageUrl);
    console.log(checkPageUrl());;
    checkButton = document.getElementById("zip-check-button");
    zipInput = document.getElementById("zip-input");
    paramString = params.toString().replace(/\D/g,'');
    if(paramString < 5){
        console.log("no string");
    }
    else{
    console.log(paramString);
}

}

function processZip(){
    if(zipValid){
        addZipToUrlAndGo();
    }
    else{
        zipError.style.visibility = "visible";
    }
}

function addZipToUrlAndGo(){

    zipValue = zipInput.value;
    console.log(zipValue);  
    let searchString = "?zip=" + zipValue;
    let newUrl = baseUrl + resultsUrl + searchString;
    window.location.href = newUrl;
}   


//checks the url to see what page is currently being viewed
function checkPageUrl(){
    if(pageUrl === "index.html"){
        currentPage = "index";
        return "index";
    }
    else if(pageUrl === "results.html"){
        currentPage = "results";
        return "results";
    }
}


function checkZipFormat(zip){
    var isValidZip = true;  
    //allways check
    isValidZip = /^\d+(?:\-\d{0,4})?$/.test(zip);



    //check at 5 characters
    if(zip.length === 5){
        isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);

        if(isValidZip){
            zipValid = true;
        }
    }
    //check at 10 characters (includes daash)
    if(zip.length === 10){
        isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);
        if(isValidZip){
            zipValid = true;
        }
    }
    return isValidZip;
}

function addZipDash(){
    zipValue = zipInput.value; //update variable of input value
    zipValue = zipValue.replace("-",""); //not sure
    if (zipValue.length > 5) {
        zipValue = zipValue.substring(0,5) + "-" + zipValue.substring(5);
    }
    zipInput.value = zipValue;
}

function zipCheck(){
         zipValid = false
        if(checkZipFormat(zipValue) === false){
            zipError.style.visibility = "visible";
        }
        else{
            zipError.style.visibility = "hidden";
        }
        if(zipValue === ""){
            console.log("empty");
            zipError.style.visibility = "hidden";
        }
    
}


function getZipFromUrl(){
    const queryString = url.search;
    const urlParams = new URLSearchParams(queryString);
    zipCode = urlParams.get('zip')

    //if there is no zip redirect to index
    if(zipCode === null || zipCode.length !== 5 || isNaN(zipCode)){
        let newUrl = baseUrl + indexUrl;
        window.location.href = newUrl;
    }
    console.log("zip from url:" + zipCode);
}





