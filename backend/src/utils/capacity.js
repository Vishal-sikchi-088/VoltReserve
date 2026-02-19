const SLOTS_PER_HOUR = 4;

function buildHourlyCapacities(hourlyCapacity, startHourUtc, hours) {
  const capacities = [];
  let remainder = 0;

  for (let i = 0; i < hours; i += 1) {
    const desired = hourlyCapacity + remainder;
    const hourCapacity = Math.floor(desired);
    remainder = desired - hourCapacity;
    capacities.push({
      hourStart: new Date(startHourUtc.getTime() + i * 60 * 60 * 1000),
      capacity: hourCapacity
    });
  }

  return capacities;
}

function distributeHourCapacity(hourCapacity) {
  const base = Math.floor(hourCapacity / SLOTS_PER_HOUR);
  const extra = hourCapacity % SLOTS_PER_HOUR;
  const slots = [];

  for (let i = 0; i < SLOTS_PER_HOUR; i += 1) {
    const value = base + (i < extra ? 1 : 0);
    slots.push(value);
  }

  return slots;
}

function buildSlotsForWindow(hourlyCapacity, windowStartUtc, hours) {
  const slots = [];
  const startHourUtc = new Date(windowStartUtc.getTime());
  startHourUtc.setUTCMinutes(0, 0, 0);

  const hourlyCapacities = buildHourlyCapacities(hourlyCapacity, startHourUtc, hours);

  for (let i = 0; i < hourlyCapacities.length; i += 1) {
    const hourInfo = hourlyCapacities[i];
    const slotCapacities = distributeHourCapacity(hourInfo.capacity);

    for (let j = 0; j < SLOTS_PER_HOUR; j += 1) {
      const slotStart = new Date(hourInfo.hourStart.getTime() + j * 15 * 60 * 1000);
      const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);

      if (slotEnd <= windowStartUtc) {
        continue;
      }

      slots.push({
        startUtc: slotStart,
        endUtc: slotEnd,
        maxCapacity: slotCapacities[j]
      });
    }
  }

  return slots;
}

module.exports = {
  buildSlotsForWindow
};

