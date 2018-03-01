const express = require('express');
const epoch = require('unix-timestamp');
const SunCalc = require('suncalc');
const app = express();
const appJs = require('./app');
// const locator = require('./location')

// console.log("main.js sanity check");

const nowEpoch = epoch.now(),
      avgDay = 86400,
      today = epoch.toDate(nowEpoch),
      yesterday = epoch.toDate(nowEpoch - avgDay),
      tomorrow = epoch.toDate(nowEpoch + avgDay),
      originLat = -48.876667,
      originLng = -123.393333

// Origin
// let currentLat = originLat
// let currentLng = originLng

// Austin
let currentLat = 30.2672
let currentLng = -97.7431

// Salem
// let currentLat = 44.966162
// let currentLng = -122.962778

// Greenland
// let currentLat = 77.221300
// let currentLng = -41.876450

function CalcTimes (yester, tod, tom, lat, lng) {
  this.sunsetYesterday = epoch.fromDate(SunCalc.getTimes(yester, lat, lng).sunset)
  this.sunriseToday = epoch.fromDate(SunCalc.getTimes(tod, lat, lng).sunrise)
  this.solarNoon = epoch.fromDate(SunCalc.getTimes(tod, lat, lng).solarNoon)
  this.sunsetToday = epoch.fromDate(SunCalc.getTimes(tod, lat, lng).sunset)
  this.sunriseTomorrow = epoch.fromDate(SunCalc.getTimes(tom, lat, lng).sunrise)
}

const originTimes = new CalcTimes(yesterday, today, tomorrow, originLat, originLng)
const hereTimes = new CalcTimes(yesterday, today, tomorrow, currentLat, currentLng)

function EpochEarthTimeStamps (obj) {
  this.now = nowEpoch
  this.dayStart = obj.sunriseToday - ((obj.sunriseToday - obj.sunsetYesterday) / 2)
  this.solarSight = obj.sunriseToday
  this.solarNoon = obj.solarNoon
  this.solarClipse = obj.sunsetToday
  this.dayEnd = obj.sunriseTomorrow - ((obj.sunriseTomorrow - obj.sunsetToday) / 2)
}

const originTimeEpoch = new EpochEarthTimeStamps(originTimes)
const hereTimeEpoch = new EpochEarthTimeStamps(hereTimes)
// console.log(originTimeEpoch);
// console.log(hereTimeEpoch);

function EarthTimeConverter (originObj, hereObj) {
  this.now = (originObj.now - originObj.dayStart) / (originObj.dayEnd - originObj.dayStart) * 1000;
  // find the difference between origin.dayStart and here.dayStart. Save as delta. Add to all numbers.
  this.delta = (hereObj.dayStart - originObj.dayStart);
  this.dayStart = ((hereObj.dayStart + this.delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)
  this.solarSight = ((hereObj.solarSight + this.delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)
  this.solarNoon = ((hereObj.solarNoon + this.delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)
  this.solarClipse = ((hereObj.solarClipse + this.delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)
  this.dayEnd = ((hereObj.dayEnd + this.delta - hereObj.dayStart) / (hereObj.dayEnd - hereObj.dayStart) * 1000)
}

const hereConverter = new EarthTimeConverter(originTimeEpoch, hereTimeEpoch)
// console.log(hereConverter);
// const hereConverter = new EarthTimeConverter(hereTimeEpoch)originObj

function clockface (obj) {
  this.location = 'Earth Time at: ' + currentLat + ', ' + currentLng
  this.globalNow = '@' + Math.round(obj.now)
  if (obj.now > (obj.dayStart) && obj.now < obj.solarSight) {
    this.localNow = '*|@' + Math.round(obj.now - obj.dayStart) + '|@' + Math.round(obj.solarSight - obj.now) + '|^'
  } else if (obj.now > obj.solarSight && obj.now < obj.solarNoon) {
    this.localNow = '^|@' + Math.round(obj.now - obj.solarSight) + '|@' + Math.round(obj.solarNoon - obj.now) + '|#'
  } else if (obj.now > obj.solarNoon && obj.now < obj.solarClipse) {
    this.localNow = '#|@' + Math.round(obj.now - obj.solarNoon) + '|@' + Math.round(obj.solarClipse - obj.now) + '|-'
  } else if (obj.now > obj.solarClipse && obj.now < obj.dayEnd) {
    this.localNow = '-|@' + Math.round(obj.now - obj.solarClipse) + '|@' + Math.round(obj.dayEnd - obj.now) + '|*'
  }
  this.dayStart = '*' + Math.round((obj.dayStart + 1000) % 1000)
  this.sunSight = '^' + Math.round((obj.solarSight + 1000) % 1000)
  this.solarNoon = '#' + Math.round((obj.solarNoon + 1000) % 1000)
  this.sunClipse = '-' + Math.round((obj.solarClipse + 1000) % 1000)
  this.dayEnd = '*' + Math.round((obj.dayEnd + 1000) % 1000)
}

const jsonClockface = new clockface(hereConverter)

module.exports.RawBeats = jsonClockface
module.exports.Lat = currentLat
module.exports.Lng = currentLng
module.exports.clockface = clockface

// clockface(hereConverter)
