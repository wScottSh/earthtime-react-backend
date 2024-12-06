
const SunCalc = require('suncalc');

// Default coordinates (Austin, TX)
let currentCoords = { lat: 30.2672, lng: -97.7431 };

const updateCoords = (coords) => {
  if (!isValidCoords(coords)) {
    throw new Error('Invalid coordinates');
  }
  currentCoords = { ...coords };
  return currentCoords;
};

const isValidCoords = (coords) => {
  return coords?.lat >= -90 && coords?.lat <= 90 && 
         coords?.lng >= -180 && coords?.lng <= 180;
};

const calculateEarthTime = () => {
  const now = new Date();
  const today = new Date(now);
  const yesterday = new Date(now.setDate(now.getDate() - 1));
  const tomorrow = new Date(now.setDate(now.getDate() + 2));

  const times = SunCalc.getTimes(today, currentCoords.lat, currentCoords.lng);
  const yesterdayTimes = SunCalc.getTimes(yesterday, currentCoords.lat, currentCoords.lng);
  const tomorrowTimes = SunCalc.getTimes(tomorrow, currentCoords.lat, currentCoords.lng);

  const dayStart = (times.sunrise.getTime() + yesterdayTimes.sunset.getTime()) / 2000;
  const dayEnd = (tomorrowTimes.sunrise.getTime() + times.sunset.getTime()) / 2000;
  const currentTime = Date.now() / 1000;

  const dayLength = dayEnd - dayStart;
  const normalizedTime = ((currentTime - dayStart) / dayLength) * 1000;

  return {
    beatLength: dayLength,
    coords: currentCoords,
    earthTime: {
      now: normalizedTime,
      dayStart: 0,
      solarSight: ((times.sunrise.getTime() / 1000 - dayStart) / dayLength) * 1000,
      solarNoon: ((times.solarNoon.getTime() / 1000 - dayStart) / dayLength) * 1000,
      solarClipse: ((times.sunset.getTime() / 1000 - dayStart) / dayLength) * 1000,
      dayEnd: 1000
    }
  };
};

module.exports = {
  calculateEarthTime,
  updateCoords
};