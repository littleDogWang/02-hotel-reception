// Public reference only. Keep customer records, inventory and business actions out of this module.
export const SCENARIO_KNOWLEDGE = {
  "source": {
    "kind": "Fictional hotel policy",
    "revision": "2026-11-05",
    "scope": "Configured policy examples only; no real hotel, room inventory or rate plan has been queried."
  },
  "hotel": "Agora Riverside Hotel",
  "location": "Boston, MA, United States",
  "timeZone": "America/New_York",
  "roomTypes": [
    {
      "name": "Standard king room",
      "maxGuests": 2,
      "bedding": "One king bed",
      "bestFor": "One or two guests sharing one bed"
    },
    {
      "name": "Standard twin room",
      "maxGuests": 2,
      "bedding": "Two single beds",
      "bestFor": "One or two guests needing separate beds"
    },
    {
      "name": "Family suite",
      "maxGuests": 4,
      "bedding": "One king bed and one double sofa bed",
      "bestFor": "Two adults with one or two children, or another party of up to four guests using the existing beds"
    }
  ],
  "occupancyPolicy": "Every adult, child and infant counts toward the room's maximum of two or four guests. No configured room permits more than four guests.",
  "extraBeds": "Rollaway beds are not part of the configured room options and do not increase room capacity.",
  "cribPolicy": "A crib can be requested for a child under two in a family suite, within the four-guest limit. Actual crib supply is unverified; never confirm it has been reserved.",
  "childPolicy": "Children are welcome with an accompanying adult. Recommend bedding from the child's age and the family's preference, using the configured capacities.",
  "checkIn": "From 3:00 PM hotel local time",
  "checkOut": "By 12:00 PM noon hotel local time",
  "breakfast": {
    "hours": "7:00 AM–10:00 AM hotel local time",
    "location": "Riverside restaurant",
    "rateInclusion": "Included only when the selected rate explicitly includes breakfast; the selected rate is not available here.",
    "children": "Under six: no separate breakfast charge with a paying adult. Ages six to twelve: half the adult breakfast price. Ages thirteen and older: adult price.",
    "price": "No adult breakfast price is configured, so do not invent a dollar amount."
  },
  "wifi": "Guest Wi-Fi is available throughout the hotel. No network name or password is provided here.",
  "unknownFacilities": "Pool, parking, pet policy and specific accessible-room features are not defined. State the particular unknown and discuss what needs verifying."
} as const;
