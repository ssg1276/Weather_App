

const userTab = document.querySelector(".tab1");
const searchTab = document.querySelector(".tab2");
const userContainer = document.querySelector(".main-container");
const notFound = document.querySelector(".error");
const grantAccessContainer = document.querySelector(".grant");
const searchForm = document.querySelector(".form-container");
const loadngScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

// intial varialbes

let currentTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab");
getfromSessionStorage();
//  switching function for tabs

function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");


        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            notFound.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            notFound.classList.remove("active");
            getfromSessionStorage();

        }
    }
}
userTab.addEventListener("click", () => {
    switchTab(userTab);
});
searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});


// checking for coordinates
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    //make grant container invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadngScreen.classList.add("active");
    notFound.classList.remove("active");

    //API call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        console.log(response);
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            // If the response is successful, update the UI
            loadngScreen.classList.remove("active");
            userInfoContainer.classList.add("active");

            renderWeatherInfo(data);
        } else {
            // If the response is not successful, handle the error
            throw { cod: response.status, message: data.message || "City not found" };
        }
    } catch (error) {
        // console.error("Error fetching weather data:", error);

        if (error?.cod === 404) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            loadngScreen.classList.remove("active");
            notFound.classList.add("active");
        }

        const ntf = document.querySelector(".notfound");
        ntf.innerText = `${error?.message || "An unexpected error occurred"}`;
    }
}

function renderWeatherInfo(weatherInfo) {

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon ]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloud]");

    //fetch values from weatherinfo objects
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
}


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {

    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
const grantAccessButton = document.querySelector("[grant-button]");
grantAccessButton.addEventListener("click", getLocation);

const loadBtn = document.querySelector("[load-btn]");
const resetBtn = document.querySelector("[reset-btn]");
let searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if (cityName === "") return;
    else
        fetchSearchWeatherInfo(cityName);

});
resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchForm.classList.add("active");
})
async function fetchSearchWeatherInfo(city) {
    loadngScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        console.log(response);
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            // If the response is successful, update the UI
            loadngScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            // If the response is not successful, handle the error
            throw { cod: response.status, message: data.message };
        }
    } catch (error) {
        // console.error("Error fetching weather data:", error);

        if (error?.cod === 404) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            loadngScreen.classList.remove("active");
            notFound.classList.add("active");
        }

        const ntf = document.querySelector(".notfound");
        ntf.innerText = `${error?.message || "An unexpected error occurred"}`;
    }
}

