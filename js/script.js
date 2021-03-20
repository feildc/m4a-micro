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



//API VARIABLES
const apiKey = "&key=" + "AIzaSyDsZS5s176fwr-Mgdv1Sikej5VNWVqSm3A";
const api_url = "https://civicinfo.googleapis.com/civicinfo/v2/representatives?address=";
let hasGoogleData = false;

let hasPPSenateData = false;
let hasPPHouseData = false;
let hasSenateBillData = false;
let hasHouseBillData = false;
let PPSenateData;
let PPHouseData;
let senateBilldata;
let houseBilldata;

let senators = [];
let reps = [];
let loadError = false;

//Object to hold the subset of data for the chosen senators and reps
class senator {
    constructor() {
        this.officeName = "U.S. Senator";
        this.fullName;
        this.firstName;
        this.lastName;
        this.phoneNumber;
        this.contactUrl;
        this.m4aSupport;
        this.apiData;   
        this.id;
        this.photoUrl;
        this.party;
        this.website;
        this.state;
      }
}

class rep {
    constructor() {
        this.officeName = "Representative";
        this.fullName;
        this.firstName;
        this.lastName;
        this.phoneNumber;
        this.contactUrl;
        this.m4aSupport;
        this.apiData = [];
        this.id;
        this.photoUrl;
        this.party;
        this.website;
        this.state;
      }
}



async function getRepData(){

getGoogleData();
getPPDataFromAPI();
//getPPHouseDataFromAPI();
//getPPSenateBillDataFromAPI();
//getPPHouseBillDataFromAPI();
}





window.onload = function(){
    count += 1; 
    if(checkPageUrl() === "index"){

        const queryString = url.search;
        const urlParams = new URLSearchParams(queryString);
        console.log(urlParams.get("zip"));

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
            
        });

        //check to see if the ENTER key is hit while inputing a zip
        zipInput.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                console.log("ENTER");
                if(zipInput === document.activeElement){
                    zipButton.click();
                }
            }
        });

        if(urlParams.get("zip") === "error"){
            zipError.style.visibility = "visible";
        }


    }
    else if(checkPageUrl() === "results"){
        //Everything for the homepage can below this
        zipInput = document.getElementById("results-input");
        zipError = document.getElementById("zip-alert");
        zipButton = document.getElementById("zip-button");
        console.log(zipButton);
        zipValue = zipCode;
        getZipFromUrl();
        addZipToInput();
        getRepData();
        zipCheck();
        //check the zipcode each time it's updated
        zipInput.addEventListener('input', function (evt) {
            addZipDash();
            zipCheck();
            
        });

        //check to see if the ENTER key is hit while inputing a zip
        zipInput.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                console.log("ENTER");
                if(zipInput === document.activeElement){
                    zipButton.click();
                }
            }
        });

    

    }
    
    console.log(pageUrl);
    console.log(checkPageUrl());;
    checkButton = document.getElementById("zip-check-button");
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

function addZipToInput(){
    zipInput = document.getElementById("results-input");
    zipInput.value = zipCode;
}

async function getGoogleData(){
    const response = await fetch(api_url+zipCode+apiKey);
    const data = await response.json();

    //check if there is an error (might be better to check if desired data is there)
    if(data.offices === undefined){
        googleLoadError = true;
        console.log("GOOGLE API LOAD ERROR");
        returnToIndexZipError();
        //add function to display error content
    }
    else{
    console.log(data.offices);
    hasGoogleData = true;
    for(let i = 0; i < data.offices.length; i++){

        let tempOffice = data.offices[i].name;  

        if (tempOffice === "U.S. Senator"){
            let chosenSenators = data.offices[i].officialIndices;

            for(let j = 0; j < chosenSenators.length; j++){
                senators[j] = new senator();
                senators[j].apiData = data.officials[chosenSenators[j]];
                senators[j].fullName = data.officials[chosenSenators[j]].name;
                senators[j].phoneNumber = data.officials[chosenSenators[j]].phones;
                senators[j].photoUrl = data.officials[chosenSenators[j]].photoUrl;
                senators[j].state = data.normalizedInput.state;
            }
        }

        if (tempOffice === "U.S. Representative"){
            let chosenReps = data.offices[i].officialIndices;

            for(let k = 0; k < chosenReps.length; k++){
                reps[k] = new rep();
                reps[k].apiData = data.officials[chosenReps[k]];
                reps[k].fullName = data.officials[chosenReps[k]].name;
                reps[k].phoneNumber = data.officials[chosenReps[k]].phones;
                reps[k].photoUrl = data.officials[chosenReps[k]].photoUrl;
                reps[k].state = data.normalizedInput.state;
            }
        }


    }
    console.log(senators);
    console.log(reps);
}
}



async function getPPDataFromAPI(){
    $.ajax({
        url: "https://api.propublica.org/congress/v1/117/senate/members.json",
       type: "GET",
       dataType: "json",
       headers: { "X-API-Key": "Pj1f1AMF9xo8j1krvZaZvGUFagIBZ1yPc2r7rd6g" },
       success: function(data){
           hasPPSenateData = true;
           PPSenateData = data.results[0].members;
           addPPSenateData();
           
           $.ajax({
            url: "https://api.propublica.org/congress/v1/116/house/members.json",
            type: "GET",
            dataType: "json",
            headers: { "X-API-Key": "Pj1f1AMF9xo8j1krvZaZvGUFagIBZ1yPc2r7rd6g" },
            success: function(data){
                hasPPHouseData = true;
                PPHouseData = data.results[0].members;
                addPPhouseData();
                //console.log(PPHouseData);

                $.ajax({
                    url: "https://api.propublica.org/congress/v1/116/bills/s1129/cosponsors.json",
                    type: "GET",
                    dataType: "json",
                    headers: { "X-API-Key": "Pj1f1AMF9xo8j1krvZaZvGUFagIBZ1yPc2r7rd6g" },
                    success: function(data){
                        hasPPSenateData = true;
                        senateBilldata = data.results[0];
                        addPPSenateBillData();
                        //console.log(senateBilldata);

                        $.ajax({
                            url: "https://api.propublica.org/congress/v1/116/bills/hr1384/cosponsors.json",
                            type: "GET",
                            dataType: "json",
                            headers: { "X-API-Key": "Pj1f1AMF9xo8j1krvZaZvGUFagIBZ1yPc2r7rd6g" },
                            success: function(data){
                                hasPPHouseData = true;
                                houseBilldata = data.results[0];
                                zipValid = true;
                                addPPHouseBillData();
                                setPortraitImg();
                                setInfoElements();
                                removePlaceHolderElements();
                                setSupportElements();
                                setContactButton();
                                missingRepError();
                                //  console.log(houseBilldata);
                            },
                            error: function(){
                                console.log("PP HOUSE BILL DATA FAILED");
                                let loadError = true;
                                displayAPIError();
                            }
                        });
                    },
                    error: function(){
                        console.log("PP SENATE BILL DATA FAILED");
                        let loadError = true;
                        displayAPIError();
                    }
                });
            },
            error: function(){
                console.log("PP HOUSE MEMBER DATA FAILED");
                let loadError = true;
                displayAPIError();
            }
        });
        },
        error: function(){
            console.log("PP SENATE MEMBER DATA FAILED");
            let loadError = true;
            displayAPIError();
        }
    });
}



function getFirstName(fullName){
    let nameArray = fullName.split(" ");
    nameLength = nameArray[0].replace(/\W/g, '').length;
    if(nameLength > 1){
        firstName = nameArray[0];
    }
    else{
        firstName = nameArray[1];
    }
    return firstName;
}

function getLastName(fullName){
    let nameArray = fullName.split(" ");
    let lastName = nameArray[nameArray.length-1];
    return lastName;
}



function getPPDataFromNameSenate(name,state){
    let result;
    let lastName = getLastName(name);
    let firstName = getFirstName(name);
    let contactUrl;
    let id;
    let website;
    let party;

    
    if(hasPPSenateData === true){
        for(i = 0; i < PPSenateData.length; i++){
            let tempFirstName = PPSenateData[i].first_name;
            let tempLastName = PPSenateData[i].last_name;
            let tempState = PPSenateData[i].state;
            if(tempState === state){
                if(tempFirstName === firstName || tempLastName === lastName){
                    contactUrl = PPSenateData[i].contact_form;
                    id = PPSenateData[i].id;
                    website = PPSenateData[i].url;
                    party = PPSenateData[i].party;
                    result = {
                        tempFirstName,
                        tempLastName,
                        contactUrl,
                        id,
                        website,
                        party
                }
            }
            }
        }

    }
    else{
        console.log("Data from Propublica did not load fast enough")
        result = "Not Available"
    }
    return result;
}



function getPPDataFromNameHouse(name,state){
    let result;
    let lastName = getLastName(name);
    let firstName = getFirstName(name);
    let contactUrl;
    let id;
    let website;
    let party;

    
    if(hasPPHouseData === true){
        
        for(i = 0; i < PPHouseData.length; i++){
            let tempLastName = PPHouseData[i].last_name;
            let tempFirstName = PPHouseData[i].first_name;
            let tempState = PPHouseData[i].state;
            if(tempState === state){
                if(tempLastName === lastName || tempFirstName === firstName){
                    contactUrl = PPHouseData[i].contact_form;
                    id = PPHouseData[i].id;
                    website = PPHouseData[i].url;
                    party = PPHouseData[i].party;
                    result = {
                        tempFirstName,
                        tempLastName,
                        contactUrl,
                        id,
                        website,
                        party
                    }
                }
            }
        }
    }
    else{
        console.log("Data from Propublica did not load fast enough")
        result = "Not Available"
    }
    return result;
}

function addPPSenateData(){
    for(let i = 0; i < senators.length; i++){
        let ppItems = getPPDataFromNameSenate(senators[i].fullName,senators[i].state);

        if(ppItems !== undefined){
            senators[i].firstName = ppItems.tempFirstName;
            senators[i].lastName = ppItems.tempLastName;
            senators[i].contactUrl = ppItems.contactUrl;
            senators[i].party = ppItems.party;
            senators[i].id = ppItems.id;
            senators[i].website = ppItems.website;
        }
        else{
            //set some variable we can check to see if we got the senate member PP data compared
        }

    }
}

function addPPhouseData(){
    
    for(let i = 0; i < reps.length; i++){
        let ppItems = getPPDataFromNameHouse(reps[i].fullName,reps[i].state);   
        if(ppItems !== undefined){
        if(ppItems.tempFirstName.replace(/\W/g, '').length > 1){
                reps[i].firstName = ppItems.tempFirstName;
        }
        else{
            reps[i].firstName = getFirstName(reps[i].fullName);
        }
        reps[i].lastName = ppItems.tempLastName;
        reps[i].contactUrl = ppItems.contactUrl;
        reps[i].party = ppItems.party;
        reps[i].id = ppItems.id;
        reps[i].website = ppItems.website 
        //reps[i].m4aSupport = doesRepSponsor(reps[i].id); 
        }
        else{
            //set some variable we can check to see if we got the house member PP data compared
            reps[i].firstName = getFirstName(reps[i].fullName);
            reps[i].lastName = getLastName(reps[i].fullName);
        }
    }
}

function addPPSenateBillData(){
    for(let i = 0; i < senators.length; i++){
        senators[i].m4aSupport = doesSenatorSponsor(senators[i].id);
    }

}

function addPPHouseBillData(){
    for(let i = 0; i < reps.length; i++){
        reps[i].m4aSupport = doesRepSponsor(reps[i].id); 
    }
}


function doesRepSponsor(id){
    for(let i = 0; i < houseBilldata.cosponsors.length; i++){
        if(houseBilldata.cosponsors[i].cosponsor_id === id || houseBilldata.sponsor_id === id){
            return true;
        }
    }
    return false;
}

function doesSenatorSponsor(id){
    for(let i = 0; i < senateBilldata.cosponsors.length; i++){
        if(senateBilldata.cosponsors[i].cosponsor_id === id || senateBilldata.sponsor_id === id){
            return true;
        }
    }
    return false;
}




function setPortraitImg(){
    console.log(senators[0].photoUrl);
    for(i = 0; i < senators.length; i++){
        let portraitElement = document.getElementById("portrait-" +  (i+2));
        portraitElement.style.visibility = "initial";
        portraitElement.onerror = function(){portraitElement.src = "./assets/portrait-placeholder.svg"};
        if(senators[i].photoUrl != undefined){
        portraitElement.src = senators[i].photoUrl;
        console.log(senators[i].photoUrl);
        }
        else{
            portraitElement.src = "./assets/portrait-placeholder.svg";
        }
    }
    for(i = 0; i < reps.length; i++){
        let portraitElement = document.getElementById("portrait-" +  (i+1));
        portraitElement.style.visibility = "initial";
        portraitElement.onerror = function(){portraitElement.src = "./assets/portrait-placeholder.svg"};
        if(reps[i].photoUrl != undefined){
        portraitElement.src = reps[i].photoUrl;
        console.log(reps[i].photoUrl);
        }
        else{
            portraitElement.src = baseUrl+ "/assets/portrait-placeholder.svg";
        }
    }
}


function setInfoElements(){
    for(i = 0; i < senators.length; i++){
        let itemNumber = i+2
        let firstName = document.getElementById("firstname-" +  itemNumber);
        let lastName = document.getElementById("lastname-" +  itemNumber);
        let phoneNumber = document.getElementById("phone-" +  itemNumber);
        if(senators[i].firstName !== undefined){
            firstName.innerHTML = senators[i].firstName;
        }
        if(senators[i].lastName !== undefined){
            lastName.innerHTML = senators[i].lastName;
        }
        if(senators[i].phoneNumber !== undefined){
            phoneNumber.innerHTML = senators[i].phoneNumber[0];
            let fetchedNumber = senators[i].phoneNumber[0].toString();
            fetchedNumber = fetchedNumber.replace("(","");
            fetchedNumber = fetchedNumber.replace(")","-");
            fetchedNumber = fetchedNumber.replace(" ","");
            phoneNumber.href = "tel:" + fetchedNumber;
        }

    }

    for(i = 0; i < reps.length; i++){
        let itemNumber = i+1;
        let firstName = document.getElementById("firstname-" +  itemNumber);
        let lastName = document.getElementById("lastname-" +  itemNumber);
        let phoneNumber = document.getElementById("phone-" +  itemNumber);
        
        
        if(reps[i].firstName !== undefined){
            firstName.innerHTML = reps[i].firstName;
        }
        if(reps[i].lastName !== undefined){
            lastName.innerHTML = reps[i].lastName;
        }
        if(reps[i].phoneNumber !== undefined){
            phoneNumber.innerHTML = reps[i].phoneNumber[0];
            let fetchedNumber = reps[i].phoneNumber[0].toString();
            fetchedNumber = fetchedNumber.replace("(","");
            fetchedNumber = fetchedNumber.replace(")","-");
            fetchedNumber = fetchedNumber.replace(" ","");
            phoneNumber.href = "tel:" + fetchedNumber;
        }


    }

}


function removePlaceHolderElements(){
    let resultsInfo = document.getElementsByClassName("result-info");
    let seatTags = document.getElementsByClassName("seat-wrap");
    let nameWraps = document.getElementsByClassName("name-wrap");
    let stanceTexts = document.getElementsByClassName("stance-text");
    let contactButtons = document.getElementsByClassName("contact-button");
    let stanceIcons = document.getElementsByClassName("support-icon");
    let phoneNumbers = document.getElementsByClassName("phone-container");
    let portraitContainers = document.getElementsByClassName("portrait-container");
    console.log(stanceIcons);
    for(let i = 0; i < resultsInfo.length; i++){
        resultsInfo[i].style.width = "initial";
    }
    for(let i = 0; i < seatTags.length; i++){
        seatTags[i].classList.remove("placeholder");
        seatTags[i].querySelector("h5").style.visibility = "visible";
    }
    for(let i = 0; i < nameWraps.length; i++){
        nameWraps[i].classList.remove("placeholder");
    }
    for(let i = 0; i < stanceTexts.length; i++){
        stanceTexts[i].classList.remove("placeholder");
    }
    for(let i = 0; i < contactButtons.length; i++){
        contactButtons[i].classList.remove("placeholder");
        contactButtons[i].querySelector("img").style.visibility = "visible";
        contactButtons[i].querySelector("span").style.visibility = "visible";
    }
    for(let i = 0; i < stanceIcons.length; i++){
        stanceIcons[i].style.visibility = "visible";
    }
    for(let i = 0; i < phoneNumbers.length; i++){
        phoneNumbers[i].style.visibility = "visible";
    }
    for(let i = 0; i < portraitContainers.length; i++){
        portraitContainers[i].classList.remove("placeholder");
    }
}



function setSupportElements(){
    for(i = 0; i < senators.length; i++){
        let supportIcon = document.getElementById("support-icon-" +  (i+2));
        let supportText = document.getElementById("support-text-" +  (i+2));
        if(senators[i].m4aSupport != undefined){
            let stance = senators[i].m4aSupport;
            supportIcon.classList.remove("against-icon");//remove any existing stance
            supportText.classList.remove("against","for");//remove any existing stance
            supportText.innerHTML = "";
            console.log(supportIcon);
            if(stance === true){
                supportIcon.classList.add('for-icon');
                supportText.innerHTML = "Supports Medicare For All";
                supportText.classList.add('for');
            }
            else if(stance === false){
                supportIcon.classList.add('against-icon');
                supportText.innerHTML = "Does not support Medicare For All";
                supportText.classList.add('against');
            }
        }
        else{
            supportIcon.style.visibility = "hidden" ;
        }
    }
    for(i = 0; i < reps.length; i++){
        let supportIcon = document.getElementById("support-icon-" +  (i+1));
        let supportText = document.getElementById("support-text-" +  (i+1));
        if(reps[i].m4aSupport != undefined){
            let stance = reps[i].m4aSupport;
            supportIcon.classList.remove("against-icon");//remove any existing stance
            supportText.classList.remove("against","for");//remove any existing stance
            supportText.innerHTML = "";
            console.log(supportIcon);
            if(stance === true){
                supportIcon.classList.add('for-icon');
                supportText.innerHTML = "Supports Medicare For All";
                supportText.classList.add('for');
            }
            else if(stance === false){
                supportIcon.classList.add('against-icon');
                supportText.innerHTML = "Does not support Medicare For All";
                supportText.classList.add('against');  
            }
        }
        else{
            supportIcon.style.visibility = "hidden" ;
        }
    }
}


function setContactButton(){
    for(i = 0; i < senators.length; i++){
        let contactButton = document.getElementById("contact-" +  (i+2));
        if(senators[i].contactUrl != undefined){
            contactButton.href = senators[i].contactUrl;
        }
        else if(senators[i].website != undefined){
            contactButton.href = senators[i].website;
        }
        else{
            contactButton.classList.add('disabled');
            contactButton.querySelector("span").innerHTML = "Site Unavailable";
        }
    }


    for(i = 0; i < reps.length; i++){
        let contactButton = document.getElementById("contact-" +  (i+1));
        if(reps[i].contactUrl != undefined){
            contactButton.href = reps[i].contactUrl;
        }
        else if(reps[i].website != undefined){
            contactButton.href = reps[i].website;
        }
        else{
            contactButton.classList.add('disabled');
            contactButton.querySelector("span").innerHTML = "Site Unavailable";
        }

    }
}

function missingRepError(){
    if(reps.length === 0){
        let resultBox = document.getElementById("result" +  (i+1));
        resultBox.classList.add('error');
        resultBox.innerHTML = "<div class='errorbox'><div class='error-wrap'><img src='./assets/404-img.png'><span>Sorry we couldn't load this representative</span></div></div>";
    }

    for(let i = 0; i > 2; i++){
        if(reps[i] == undefined){
            let resultBox = document.getElementById("result" +  (i+2));
            resultBox.classList.add('error');
            resultBox.innerHTML = "<div class='errorbox'><div class='error-wrap'><img src='./assets/404-img.png'><span>Sorry we couldn't load this representative</span></div></div>";
        }
    }
}

function returnToIndexZipError(){  
    window.location.href = baseUrl + indexUrl + "?zip=error";
}

function displayAPIError(){  
    let resultsBox = document.getElementById("results");
    resultsBox.classList.add('error');
    resultsBox.innerHTML = "";
    resultsBox.innerHTML = "<div class='errorbox-large'><div class='error-wrap'><img src='./assets/404-img.png'><span>Sorry we ran into a problem retrieving your representative's data.</span></div></div>"
}

