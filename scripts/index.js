// Where the cool stuff happens

//* Sols, or Martian solar days, are only 39 minutes and 35 seconds longer than Earth days, 
//and there are 668 sols (687 Earth days) in a Martian year.

// const API_KEY="DEMO_KEY"  //key for the demo API
const API_KEY="qqqpFDkWMwlKaYxqSlop1tcJeTigo0QDC88Bn5L1"
const API_URL=`https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`
// console.log(API_URL);



// Change this if you need to
const previousWeatherToggle = document.querySelector('.show-previous-weather');

const previousWeather = document.querySelector('.previous-weather');

const currentSolElement=document.querySelector("[data-current-sol]");
const currentDateElement=document.querySelector("[data-current-date]");
const currentTempHighElement=document.querySelector("[data-current-temp-high]");
const currentTempLowElement=document.querySelector("[data-current-temp-low]");
const windSpeedElement=document.querySelector("[data-wind-speed]");
const windDirectionText=document.querySelector("[data-wind-direction-text]");
const windDirectionArrow=document.querySelector("[data-wind-direction-arrow]");

//Previous Sols
const previousSolTemplate=document.querySelector("[data-previous-sol-template]");
const previousSolContainer=document.querySelector("[data-previous-sols]");

const unitToggle= document.querySelector("[data-unit-toggle]");   //Grabs the button(toggles)
const metricRadio=document.getElementById("cel");
const imperialRadio=document.getElementById("fah");

previousWeatherToggle.addEventListener('click', () => {
    previousWeather.classList.toggle('show-weather')
});

let selectedSolIndex;  //Global Declaration
// ".then" are used to work with Promises.
getWeather()
    .then(sols=> {
        // selectedSolIndex= sols.length-1; displays last/latest sol
        selectedSolIndex=sols.length-1;
        displaySelectedSols(sols);
        displayPreviousSols(sols);
        console.log(sols);

        displaySelectedSols(sols);
        displayPreviousSols(sols);
        updateUnits();  // provides initial value for the Units(or else unit place appears empty)
        
        unitToggle.addEventListener("click", ()=>{
            let metricUnits= !isMetric();      //try this with example.
            metricRadio.checked=metricUnits;
            imperialRadio.checked=!metricUnits;

            displaySelectedSols(sols);
            displayPreviousSols(sols);  
            updateUnits();     //calling this function on click
        })
        // These two statements can be declared anywhere
        metricRadio.addEventListener("change",() =>{
            displaySelectedSols(sols);
            displayPreviousSols(sols);
            updateUnits();
        });
        imperialRadio.addEventListener("change", ()=>{
        displaySelectedSols(sols);
        displayPreviousSols(sols);
        updateUnits()
        });
    }); 

function displaySelectedSols(sols) {
    const selectedSol= sols[selectedSolIndex];

    currentSolElement.innerText=selectedSol.sol;
    currentDateElement.innerText=displayDate(selectedSol.date);
    currentTempHighElement.innerText=displayTemperature(selectedSol.maxTemp);
    currentTempLowElement.innerText=displayTemperature(selectedSol.minTemp);
    windSpeedElement.innerText=displaySpeed(selectedSol.windSpeed);
    windDirectionText.innerText=selectedSol.windDirectionCardinal;
    windDirectionArrow.style.setProperty(
        "--direction",`${selectedSol.windDirectionDegress}deg`);

    // console.log(selectedSol)
}

function displayTemperature(temperature) {
    let returnTemp=temperature;
    if(!isMetric())
        returnTemp= (temperature * 9/5) + 32;
    return Math.round(returnTemp);
}
function displaySpeed(speed) {
    let returnSpeed=speed;
    if(!isMetric())
        returnSpeed= speed*3.6;
    return Math.round(returnSpeed);
}
function displayPreviousSols(sols) {
    previousSolContainer.innerHTML="";    //empty
    //iterates over every sol
    sols.forEach((solData,index) => {
        const solContainer=previousSolTemplate.content.cloneNode(true);  //makes a copy of the template and stores it in that const variable
        solContainer.querySelector("[data-sol]").innerText=solData.sol;
        solContainer.querySelector("[data-date]").innerText=displayDate(solData.date);
        solContainer.querySelector("[data-temp-high]").innerText=displayTemperature(solData.maxTemp);
        solContainer.querySelector("[data-temp-low]").innerText=displayTemperature(solData.minTemp);
        solContainer.querySelector("[data-select-button]").addEventListener("click",()=>{
            selectedSolIndex=index;
            displaySelectedSols(sols);
        })
        previousSolContainer.appendChild(solContainer);   //add a new child to the empty container
    });
}
function displayDate(date){
    return date.toLocaleDateString(
        undefined,  // converts the timezone to the timezone being used by browser(auto)
        {   day: "2-digit",
            month: "long"
        }
    )
}

function getWeather(){
    return fetch(API_URL)             // returns a Promise
        .then(res =>res.json())  // Converts the response to json and returns it.
        .then(data => {
            //Destructuring Data into separate Variables.
            const{
                sol_keys,
                validity_checks,
                ...solData    // "..." symbol is used to store Rest(remaining) of the data.
            }=data;
            console.log(solData);   //prints the solData(The imp data we require)
            //Iterating over values of each array using "map" 
            //and creating a new object with required data and returning it
            return Object.entries(solData).map(([sol,data])=>{
                return {
                    sol:sol,
                    maxTemp: data?.AT?.mx,
                    minTemp: data?.AT?.mn,
                    windSpeed: data?.HWS?.av,
                    windDirectionDegress: data.WD.most_common?.compass_degrees,
                    windDirectionCardinal: data.WD.most_common?.compass_point,
                    date: new Date(data.First_UTC)
                }
            })
        })
    }

function updateUnits() {
    const speedUnits= document.querySelectorAll("[data-speed-unit]");
    const tempUnits= document.querySelectorAll("[data-temp-unit]");

    speedUnits.forEach(unit =>{
        unit.innerText= isMetric()? "m/s" : "k/h";
    })
    tempUnits.forEach(unit =>{
        unit.innerText= isMetric()? "C" : "F";
    })
}

function isMetric() {
    return metricRadio.checked; 
}