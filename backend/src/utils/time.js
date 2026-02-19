function getUtcNow() {
  return new Date();
}

function toIsoUtc(date) {
  return date.toISOString();
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addHours(date, hours) {
  return addMinutes(date, hours * 60);
}

function ceilToNextQuarterHour(date) {
  const copy = new Date(date.getTime());
  copy.setUTCSeconds(0, 0);
  const minutes = copy.getUTCMinutes();
  const quarters = Math.ceil(minutes / 15);
  const nextMinutes = quarters * 15;
  copy.setUTCMinutes(nextMinutes);
  return copy;
}

module.exports = {
  getUtcNow,
  toIsoUtc,
  addMinutes,
  addHours,
  ceilToNextQuarterHour
};

