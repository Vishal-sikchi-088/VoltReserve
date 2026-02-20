## VoltReserve Operator Panel Guide

This guide explains how to use the VoltReserve operator console and how the underlying booking logic and capacity calculations work.

---

### Accessing the operator console

- Sign in as a user with the `OPERATOR` role.
- Open the `/operator` route in your browser.
- You will see:
  - A header showing your signed-in operator account.
  - A **Stations** card on the left.
  - A **Next 24 hours** availability card in the middle.
  - A **Your bookings** card on the right.

You can always open this guide from the **?** help button next to the "Operator console." title.

---

### Operator console overview

The screenshot below shows the operator console with station list, slots, and bookings.

![Operator console overview](admin/admin-panel-overview.png)

> Replace this screenshot path with an operator-specific image (for example `operator/operator-console-overview.png`) when available.

---

### Stations card

The **Stations** card lists all swap stations that the operator can book:

- Columns:
  - **Name** – station name.
  - **Location** – human-readable location label.
  - **Hourly capacity** – how many swap sessions the station can handle per hour.
- Selecting a station:
  - Click any row to highlight it.
  - The **Next 24 hours** card will load slots for that station.

If no stations are available, the card shows a short message instead of a table.

---

### Next 24 hours card

The **Next 24 hours** card shows a rolling 24‑hour window of 15‑minute slots for the selected station.

- Before selecting a station:
  - The card tells you to select a station first.
- After selecting a station:
  - The card loads all slots between **now** and **now + 24 hours**.
  - Each slot is rendered as a pill:
    - Time label (for example `14:30`).
    - Capacity label: `available / max` (for example `2/4`).
  - Slots with capacity greater than 0 are clickable and styled as available.
  - Slots with no remaining capacity are disabled.
- Live updates:
  - When a station is selected, the slots refresh automatically every 60 seconds.
  - As time moves forward, old slots drop out and new ones appear at the end of the 24‑hour window.

#### Slot generation logic (backend)

The backend builds slots using a consistent algorithm:

- Take the current UTC time and round up to the next 15‑minute boundary.
- Generate 15‑minute intervals up to 24 hours ahead.
- For each interval:
  - Compute how many bookings already exist in that window.
  - Use the station's `hourly_capacity` to determine how many bookings are allowed.
  - Calculate:
    - `maxCapacity` – the theoretical capacity for that slot.
    - `availableCapacity = maxCapacity - existingBookings`.
- Only future slots are included; past intervals are automatically excluded.

On the frontend, each slot is shown as a button; clicking an available slot calls the booking API.

---

### Creating and rescheduling bookings

When a station is selected and there are available slots:

- **Create a new booking**
  - Click a slot with available capacity.
  - The system creates a booking for that station and start time.
  - On success:
    - The **Your bookings** card refreshes.
    - The **Next 24 hours** slots refresh to reflect the new capacity.
- **Reschedule an existing booking**
  - In the **Your bookings → Upcoming** list, click **Reschedule** for a booking.
  - The system switches into "reschedule" mode:
    - The station for that booking is auto‑selected.
    - A message appears above the slots explaining you are rescheduling a specific start time.
  - Click a new slot to confirm the reschedule:
    - A new booking is created for the new slot.
    - The original booking is cancelled.
    - A success message confirms the reschedule.

If any booking request fails (for example due to timing rules), an error message is shown in the **Next 24 hours** card.

---

### Your bookings card

The **Your bookings** card summarises current and past bookings for the signed‑in operator.

- Sections:
  - **Upcoming** – future bookings that have not started yet.
  - **History** – bookings that have already started.

If you have no bookings yet, the card shows a simple "No bookings yet." message.

#### Upcoming bookings

Columns:

- **Station** – station name.
- **Start** – local date and time of the booking.
- **Status** – a colored status icon (see "Status icons" below).
- Actions:
  - **Cancel** – cancel the booking if it is still allowed.
  - **Reschedule** – move the booking to a different slot.

Cancellation rule:

- A booking can only be cancelled while:
  - It is in the `CONFIRMED` status, and
  - The start time is at least 1 hour in the future.
- If cancellation is not allowed, the action buttons are hidden.

#### History

Columns:

- **Station** – station name.
- **Start** – local date and time of the booking.
- **Status** – final status of the booking.

History rows are read‑only; you cannot cancel or reschedule completed or expired bookings.

---

### Status icons

In the **Upcoming** and **History** tables, the status column uses icons instead of full words.

- Green filled circle – `CONFIRMED`
- Blue filled circle – `COMPLETED`
- Red filled circle – `NO_SHOW`
- Grey circle – `CANCELLED`

You can hover any icon to see a tooltip with the full text status.

#### Status lifecycle (backend logic)

- When a booking is created:
  - It starts in the `CONFIRMED` status.
- When the manager marks a booking as completed at the station:
  - Status changes to `COMPLETED`.
- If the operator does not arrive before the arrival deadline:
  - A background process marks the booking as `NO_SHOW`.
- If the operator cancels the booking early enough:
  - Status changes to `CANCELLED`.

These statuses are also used by the admin station metrics to calculate completion rate, no‑show rate, and utilization.

---

### Capacity and booking rules

Behind the scenes, the system enforces a few important rules:

- **Hourly capacity**
  - Each station has a configured `hourly_capacity`.
  - This defines how many bookings can be active per hour at that station.
- **15‑minute slots**
  - The 24‑hour window is split into 96 slots (4 per hour × 24 hours).
  - The backend tracks how many bookings overlap each slot.
- **Available capacity per slot**
  - For each 15‑minute slot:
    - `maxCapacity` is derived from `hourly_capacity`.
    - `availableCapacity = maxCapacity - currentBookings`.
  - Slots with `availableCapacity <= 0` are shown as unavailable on the operator panel.
- **Cancellation window**
  - Operators can cancel only when:
    - The booking is `CONFIRMED`, and
    - The start time is at least 1 hour in the future.

These rules ensure that the station capacity is not oversubscribed and that last‑minute cancellations are controlled.

---

### Practical tips for operators

- Keep an eye on the **Next 24 hours** card:
  - It refreshes automatically; new capacity appears as other operators cancel or reschedule.
- Use reschedule instead of cancel + re‑book:
  - Rescheduling preserves the intent while freeing the original slot.
- Watch status icons in **Your bookings**:
  - Green icons indicate future confirmed work.
  - Blue icons show completed work.
  - Red icons highlight missed appointments (`NO_SHOW`).

---

### Getting help

- Click the **?** help button on the operator console header to open this guide.
- Share this page with new operators as a quick onboarding resource.

