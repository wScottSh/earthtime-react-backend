const Epoch = require('unix-timestamp');
const SunCalc = require('suncalc');

const nowEpoch = Math.round(new Date().getTime()/1000.0),
      today = Epoch.toDate(nowEpoch), // date rather than timestamp
      yesterday = Epoch.toDate(Epoch.now('-1d')), // date rather than timestamp
      tomorrow = Epoch.toDate(Epoch.now('1d')), // date rather than timestamp
      originCoords = {lat: -48.876667, lng: -123.393333},
      coords = {lat: -48.876667, lng: -123.393333}

let   beatLength = 86400 // default in milliseconds

// Austin
let userCoords = {lat: 30.2672, lng: -97.7431}
// let userCoords = {lat: -48.876667, lng: -123.393333}

// will update the coords with whatever new coords object
const updateCoords = (newCoords) => {
  coords.lat = newCoords.lat
  coords.lng = newCoords.lng
}

updateCoords(userCoords)

// returns an object that contains all relevant timestamps for calculating earth time
const eventCalculators = (yester, tod, tom, lat, lng) => {
  return {
    sunsetYesterday: SunCalc.getTimes(yester, lat, lng).sunset,
    sunriseToday: SunCalc.getTimes(tod, lat, lng).sunrise,
    solarNoonToday: SunCalc.getTimes(tod, lat, lng).solarNoon,
    sunsetToday: SunCalc.getTimes(tod, lat, lng).sunset,
    sunriseTomorrow: SunCalc.getTimes(tom, lat, lng).sunrise
  }
}

const todaysEpochTimestamps = (obj) => {
  return {
    now: nowEpoch,
    dayStart: (obj.sunriseToday - ((obj.sunriseToday - obj.sunsetYesterday) / 2)) / 1000,
    solarSight: Epoch.fromDate(obj.sunriseToday),
    solarNoon: Epoch.fromDate(obj.solarNoonToday),
    solarClipse: Epoch.fromDate(obj.sunsetToday),
    dayEnd: (obj.sunriseTomorrow - ((obj.sunriseTomorrow - obj.sunsetToday) / 2)) / 1000
  }
}

// calculates the actual number of milliseconds one beat is based on actual day length
const beatLengthFinder = (obj) => {
  let dayLength = obj.dayEnd - obj.dayStart
  beatLength = dayLength
}

beatLengthFinder(todaysEpochTimestamps(eventCalculators(yesterday, today, tomorrow, coords.lat, coords.lng)));

let originTimes = todaysEpochTimestamps(eventCalculators(yesterday, today, tomorrow, originCoords.lat, originCoords.lng))
let hereTimes = todaysEpochTimestamps(eventCalculators(yesterday, today, tomorrow, coords.lat, coords.lng))

const earthTimeConverter = (originObj, hereObj) => {
  let now = (originObj.now - originObj.dayStart) / (originObj.dayEnd - originObj.dayStart) * 1000;
  // find the difference between origin.dayStart and here.dayStart. Save as delta. Add to all numbers.
  let delta = (hereObj.dayStart - originObj.dayStart);
  let dayStart = ((hereObj.dayStart + delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)
  let solarSight = ((hereObj.solarSight + delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)
  let solarNoon = ((hereObj.solarNoon + delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)
  let solarClipse = ((hereObj.solarClipse + delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)
  let dayEnd = ((hereObj.dayEnd + delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)

  return {
    beatLength : beatLength,
    coords: {
      lat: coords.lat,
      lng: coords.lng
    },
    earthTime: {
      now: now,
      dayStart: dayStart,
      solarSight: solarSight,
      solarNoon: solarNoon,
      solarClipse: solarClipse,
      dayEnd: dayEnd
    },
    unixTime: {
      now: hereObj.now,
      dayStart: hereObj.dayStart,
      solarSight: hereObj.solarSight,
      solarNoon: hereObj.solarNoon,
      solarClipse: hereObj.solarClipse,
      dayEnd: hereObj.dayEnd
    }
  }
}

console.log(earthTimeConverter(originTimes, hereTimes));
module.exports.EarthJSON = earthTimeConverter(originTimes, hereTimes)
