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
//const apiKey = "&key=" + "AIzaSyDsZS5s176fwr-Mgdv1sdfSikej5VNWVqSm3A";//for error
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
        this.phoneNumeber;
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
        this.phoneNumeber;
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
getPPSenateDataFromAPI();
getPPHouseDataFromAPI();
getPPSenateBillDataFromAPI();
getPPHouseBillDataFromAPI();

}



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
    addZipToInput();
    
    getRepData();

    

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

async function getPPSenateDataFromAPI(){
    $.ajax({
        url: "https://api.propublica.org/congress/v1/117/senate/members.json",
       type: "GET",
       dataType: "json",
       headers: { "X-API-Key": "Pj1f1AMF9xo8j1krvZaZvGUFagIBZ1yPc2r7rd6g" },
       success: function(data){
           hasPPSenateData = true;
           PPSenateData = data.results[0].members;
           addPPSenateData();
           //console.log(PPSenateData);
        },
        error: function(){
            console.log("PP SENATE MEMBER DATA FAILED");
            let loadError = true;
        }
    });
}

async function getPPHouseDataFromAPI(){
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
        },
        error: function(){
            console.log("PP HOUSE MEMBER DATA FAILED");
            let loadError = true;
        }
    });
}


async function getPPSenateBillDataFromAPI(){
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
        },
        error: function(){
            console.log("PP SENATE BILL DATA FAILED");
            let loadError = true;
        }
    });
}


async function getPPHouseBillDataFromAPI(){
    $.ajax({
        url: "https://api.propublica.org/congress/v1/116/bills/hr1384/cosponsors.json",
        type: "GET",
        dataType: "json",
        headers: { "X-API-Key": "Pj1f1AMF9xo8j1krvZaZvGUFagIBZ1yPc2r7rd6g" },
        success: function(data){
            hasPPHouseData = true;
            houseBilldata = data.results[0];
            addPPHouseBillData();
            //  console.log(houseBilldata);
        },
        error: function(){
            console.log("PP HOUSE BILL DATA FAILED");
            let loadError = true;
        }
    });
}


function getFirstName(fullName){
    let nameArray = fullName.split(" ");
    let firstName = nameArray[0];
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
            senators[i].firstName = ppItems.tempFirstName;
            senators[i].lastName = ppItems.tempLastName;
            senators[i].contactUrl = ppItems.contactUrl;
            senators[i].party = ppItems.party;
            senators[i].id = ppItems.id;
            senators[i].website = ppItems.website;

    }
}

function addPPhouseData(){
    
    for(let i = 0; i < reps.length; i++){
        let ppItems = getPPDataFromNameHouse(reps[i].fullName,reps[i].state);
        reps[i].firstName = ppItems.tempFirstName;
        reps[i].lastName = ppItems.tempLastName;
        reps[i].contactUrl = ppItems.contactUrl;
        reps[i].party = ppItems.party;
        reps[i].id = ppItems.id;
        reps[i].website = ppItems.website 
        //reps[i].m4aSupport = doesRepSponsor(reps[i].id); 
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





