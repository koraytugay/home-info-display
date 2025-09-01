/* =========================
   Clock (top-right)
   ========================= */
function updateClock() {
  document.getElementById("currentTime").textContent =
      new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}
setInterval(updateClock, 1000);
updateClock();

/* =========================
   Weather (Open-Meteo)
   ========================= */
const THRESHOLDS = {
  temp: { ideal: [2, 25], acceptable: [-5, 2] },      // < -5 = blocker
  feelsLike: { ideal: [2, 25], acceptable: [-5, 2] },  // adjust as desired
  wind: { ideal: [0, 14], acceptable: [14, 17] },      // > 17 = blocker
  cloud: { ideal: [0, 50], acceptable: [50, 100] },
  precipitationProb: { ideal: [0, 20], acceptable: [20, 30] }, // >60 = blocker
  humidity: { ideal: [0, 60], acceptable: [60, 80] },  // >80 = blocker
};

function classify(value, { ideal, acceptable }) {
  if (value < ideal[0] || value > ideal[1]) {
    if (acceptable && value >= acceptable[0] && value <= acceptable[1])
      return "acceptable";
    return "blocker";
  }
  return "ideal";
}

async function fetchWeather() {
  const url =
      "https://api.open-meteo.com/v1/forecast?" +
      "forecast_days=2&latitude=43.70&longitude=-79.42" +
      "&hourly=temperature_2m,apparent_temperature,precipitation,precipitation_probability,relative_humidity_2m,windspeed_10m,cloudcover,uv_index,weather_code" +
      "&daily=temperature_2m_max,temperature_2m_min,sunrise" +
      "&timezone=America%2FNew_York";

  const response = await fetch(url);
  const resp = await response.json();
  console.log(resp);
  return resp;
}

function splitByDay(hourly) {
  const today = [];
  const tomorrow = [];
  for (let i = new Date().getHours(); i < 48; i++) {
    const target = i <= 23 ? today : tomorrow;
    target.push({
      hours: new Date(hourly.time[i]).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      temp: hourly.temperature_2m[i],
      feelsLike: hourly.apparent_temperature[i],
      precipitationProb: hourly.precipitation_probability[i],
      wind: hourly.windspeed_10m[i],
      humidity: hourly.relative_humidity_2m[i],
      weatherCode: hourly['weather_code'][i],
    });
  }
  return { today, tomorrow };
}

function fillWeatherTable(id, data) {
  const tableBody = document.getElementById(id);
  tableBody.innerHTML = "";
  data.forEach((rowData) => {
    let blockerExists = false;
    const row = document.createElement("tr");

    function getWeatherState(weatherCode) {
      if (weatherCode === 0) {
        return '☀️'
      }

      if (weatherCode === 1) {
        return '☀️'
      }

      if (weatherCode === 2) {
        return '⛅'
      }

      if (weatherCode === 3) {
        return '☁️'
      }

      if (weatherCode === 45 || weatherCode === 48) {
        return '🌁'
      }

      if (weatherCode === 51) {
        return '🌦️'
      }

      if (weatherCode === 53) {
        return '🌦️🌦️'
      }

      if (weatherCode === 55) {
        return '🌦️🌦️🌦️'
      }

      if (weatherCode === 56) {
        return '🌦️'
      }

      if (weatherCode === 56) {
        return '🌦️🌦️🌦️'
      }

      if (weatherCode === 61) {
        return '🌧️'
      }

      if (weatherCode === 63) {
        return '🌧️🌧️'
      }

      if (weatherCode === 65) {
        return '🌧️🌧️🌧️'
      }

      if (weatherCode === 66) {
        return '🌧️'
      }

      if (weatherCode === 67) {
        return '🌧️🌧️🌧️'
      }

      if (weatherCode === 71) {
        return '🌨️'
      }

      if (weatherCode === 73) {
        return '🌨️🌨️'
      }

      if (weatherCode === 75) {
        return '🌨️🌨️🌨️'
      }

      if (weatherCode === 77) {
        return '🌨️'
      }

      if (weatherCode === 80) {
        return '🌧️'
      }

      if (weatherCode === 81) {
        return '🌧️🌧️'
      }

      if (weatherCode === 80) {
        return '🌧️🌧️🌧️'
      }

      if (weatherCode === 85) {
        return '🌨'
      }

      if (weatherCode === 86) {
        return '🌨🌨🌨'
      }

      if (weatherCode === 95) {
        return '🌪️'
      }

      // WMO Weather interpretation codes (WW)
      // Code	Description
      // 0	Clear sky
      // 1, 2, 3	Mainly clear, partly cloudy, and overcast
      // 45, 48	Fog and depositing rime fog
      // 51, 53, 55	Drizzle: Light, moderate, and dense intensity
      // 56, 57	Freezing Drizzle: Light and dense intensity
      // 61, 63, 65	Rain: Slight, moderate and heavy intensity
      // 66, 67	Freezing Rain: Light and heavy intensity
      // 71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
      // 77	Snow grains
      // 80, 81, 82	Rain showers: Slight, moderate, and violent
      // 85, 86	Snow showers slight and heavy
      // 95 *	Thunderstorm: Slight or moderate
      // 96, 99 *	Thunderstorm with slight and heavy hail

      return weatherCode;
    }

    function makeCell(value, className) {
      const td = document.createElement("td");
      td.textContent = value;
      if (className) td.classList.add(className);
      if (className === "blocker") blockerExists = true;
      return td;
    }

    row.appendChild(makeCell(rowData.hours));
    row.appendChild(makeCell(`${rowData.feelsLike}°`, classify(rowData.feelsLike, THRESHOLDS.feelsLike)));
    row.appendChild(makeCell(`${rowData.precipitationProb}%`, classify(rowData.precipitationProb, THRESHOLDS.precipitationProb)));
    row.appendChild(makeCell(`${rowData.wind}`, classify(rowData.wind, THRESHOLDS.wind)));
    row.appendChild(makeCell(getWeatherState(rowData.weatherCode)));

    if (blockerExists) row.classList.add("blocker-row");
    tableBody.appendChild(row);
  });
}

(async () => {
  try {
    const weatherObj = await fetchWeather();
    const { today, tomorrow } = splitByDay(weatherObj.hourly);
    fillWeatherTable("today", today);
    fillWeatherTable("tomorrow", tomorrow.slice(6)); // skip early morning tomorrow
  } catch (e) {
    console.error("Weather fetch failed:", e);
  }
})();

/* =========================
   TTC Bus (your provided code)
   ========================= */

// https://www.ttc.ca/ttcapi/routedetail/schedule?route=74&direction=0&stopCode=5518
// [{"nextBusMinutes":"8","crowdingIndex":"1"},{"nextBusMinutes":"27","crowdingIndex":"2"}]

const baseUrl = "https://www.ttc.ca/ttcapi/routedetail";

// northbound
const stClairStationAtLowerPlatform = 15306;
const mtPleasantRdAtEglintonAveEastNorthSide = 5813;
const mtPleasantRdatBlythwoodRd = 5804;

// southbound
const doncliffeLoopAtGlenEchoRd = 5518;
const mtPleasantRdAtLawrenceAveEastSouthSide = 5827;
const mtPleasantRdAtStibbardAve = 5846;

function refreshUi() {
  document.getElementById("currentTime").innerText = getCurrentTime();

  populateNextBus(stClairStationAtLowerPlatform, "nb-stClairStationAtLowerPlatform-nextbus");
  populateSchedule(stClairStationAtLowerPlatform, "nb-stClairStationAtLowerPlatform-schedule", "1");

  populateNextBus(mtPleasantRdAtEglintonAveEastNorthSide, "nb-mtPleasantRdAtEglintonAveEastNorthSide-nextbus");
  populateSchedule(mtPleasantRdAtEglintonAveEastNorthSide, "nb-mtPleasantRdAtEglintonAveEastNorthSide-schedule", "1");

  populateNextBus(mtPleasantRdatBlythwoodRd, "nb-mtPleasantRdatBlythwoodRd-nextbus");
  populateSchedule(mtPleasantRdatBlythwoodRd, "nb-mtPleasantRdatBlythwoodRd-schedule", "1");

  populateNextBus(doncliffeLoopAtGlenEchoRd, "sb-doncliffeLoopAtGlenEchoRd-nextbus");
  populateSchedule(doncliffeLoopAtGlenEchoRd, "sb-doncliffeLoopAtGlenEchoRd-schedule", "0");

  populateNextBus(mtPleasantRdAtLawrenceAveEastSouthSide, "sb-mtPleasantRdAtLawrenceAveEastSouthSide-nextbus");
  populateSchedule(mtPleasantRdAtLawrenceAveEastSouthSide, "sb-mtPleasantRdAtLawrenceAveEastSouthSide-schedule", "0");

  populateNextBus(mtPleasantRdAtStibbardAve, "sb-mtPleasantRdAtStibbardAve-nextbus");
  populateSchedule(mtPleasantRdAtStibbardAve, "sb-mtPleasantRdAtStibbardAve-schedule", "0");
}

async function populateNextBus(stopCode, elementId) {
  try {
    const response = await fetch(baseUrl + "/GetNextBuses?routeId=74&stopCode=" + stopCode);
    const nextBusInfo = await response.json();
    const nextBusInDiv = document.getElementById(elementId);
    nextBusInDiv.innerHTML = "";

    let nextBusMinutesArr = [];
    for (let nextBus of nextBusInfo) {
      if (nextBus.nextBusMinutes === "D") nextBusMinutesArr.push("Delayed");
      else if (nextBus.nextBusMinutes === "0") nextBusMinutesArr.push("Due");
      else nextBusMinutesArr.push(nextBus.nextBusMinutes);
    }

    // Build: "Next bus is in X minutes [and in Y minutes]."
    const s1 = document.createElement("span");
    s1.innerText = "Next bus is in ";
    nextBusInDiv.appendChild(s1);

    const s2 = document.createElement("span");
    s2.classList.add("minutes");
    s2.innerText = nextBusMinutesArr[0] ?? "—";
    nextBusInDiv.appendChild(s2);

    if (nextBusMinutesArr.length <= 1) {
      const s3 = document.createElement("span");
      s3.innerText = " minutes.";
      nextBusInDiv.appendChild(s3);
    } else {
      const parts = [
        [" minutes", ""],
        [" and in ", ""],
        ["", "minutes"]
      ];
      const s3 = document.createElement("span"); s3.innerText = " minutes"; nextBusInDiv.appendChild(s3);
      const s4 = document.createElement("span"); s4.innerText = " and in "; nextBusInDiv.appendChild(s4);
      const s5 = document.createElement("span"); s5.classList.add("minutes"); s5.innerText = nextBusMinutesArr[1]; nextBusInDiv.appendChild(s5);
      const s6 = document.createElement("span"); s6.innerText = " minutes."; nextBusInDiv.appendChild(s6);
    }
  } catch (e) {
    console.error("populateNextBus failed:", e);
    const nextBusInDiv = document.getElementById(elementId);
    if (nextBusInDiv) nextBusInDiv.textContent = "—";
  }
}

async function populateSchedule(stopCode, elementId, direction) {
  try {
    const response = await fetch(baseUrl + "/schedule?route=74&direction=" + direction + "&stopCode=" + stopCode);
    const responseData = await response.json();
    let schedule = responseData["74A"];
    if (!schedule) schedule = responseData["74"];

    let dailySchedule;
    const currentDay = getCurrentDay();
    if (currentDay === "Sunday") dailySchedule = schedule[2].schedule;
    else if (currentDay === "Saturday") dailySchedule = schedule[1].schedule;
    else dailySchedule = schedule[0].schedule;

    // Convert "1:xx PM" hours (but not 12 PM) to 24h
    for (let i = 0; i < dailySchedule.length; i++) {
      if (!dailySchedule[i].label.startsWith("12") && dailySchedule[i].label.endsWith("PM")) {
        for (let j = 0; j < dailySchedule[i].stopTimes.length; j++) {
          let [hours, minutes] = dailySchedule[i].stopTimes[j].split(":");
          hours = 12 + parseInt(hours, 10);
          dailySchedule[i].stopTimes[j] = `${hours}:${minutes}`;
        }
      }
    }

    // Flatten all stop times
    let allScheduledTimes = [];
    for (let i = 0; i < dailySchedule.length; i++) {
      for (let j = 0; j < dailySchedule[i].stopTimes.length; j++) {
        allScheduledTimes.push(dailySchedule[i].stopTimes[j]);
      }
    }

    const currentTime = getCurrentTime();
    let firstTime = [];
    let times = [];

    for (let i = 0; i < allScheduledTimes.length; i++) {
      if (compareTimes(allScheduledTimes[i], currentTime) >= 0) {
        firstTime.push(allScheduledTimes[i - 1]);
        break;
      }
    }
    for (let i = 0; i < allScheduledTimes.length; i++) {
      if (compareTimes(allScheduledTimes[i], currentTime) >= 0) {
        times.push(allScheduledTimes[i]);
      }
    }
    times = [...firstTime, ...times];

    const scheduleTbody = document.getElementById(elementId);
    scheduleTbody.innerHTML = "";

    let counter = 0;
    for (let time of times) {
      if (counter === 5) break;
      const td = document.createElement("td");
      td.innerText = time ?? "—";
      if (counter === 0) td.classList.add("missed");
      if (counter === 1) td.classList.add("next");
      // We render a single row with multiple <td> cells, as per your original code.
      scheduleTbody.append(td);
      counter++;
    }
  } catch (e) {
    console.error("populateSchedule failed:", e);
    const scheduleTbody = document.getElementById(elementId);
    if (scheduleTbody) scheduleTbody.innerHTML = "";
  }
}

function compareTimes(t1, t2) {
  const [h1, m1] = t1.split(":").map(Number);
  const [h2, m2] = t2.split(":").map(Number);
  if (h1 !== h2) return h1 - h2;
  return m1 - m2;
}

function getCurrentTime() {
  return new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: false });
}

function getCurrentDay() {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
}

// Initial render + tick (your original interval behavior)
refreshUi();
setInterval(() => {
  if (new Date().getSeconds() === 0 || new Date().getSeconds() === 30) {
    refreshUi();
  }
}, 250);
