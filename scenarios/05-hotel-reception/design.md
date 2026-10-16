# Hotel reception design

## Positioning

Priority P5. Combine reception, FAQ answers, simulated business state and human handoff.

## Target flow

The user asks about check-in, facilities, policies or room availability. The Agent answers fixed hotel FAQ questions and uses a local read-only API for fictional nightly inventory. For a stay, query each occupied night and use the minimum count. Unknown records remain unknown. Reservations and order changes require the guest to contact the front desk; this app cannot submit or transfer a request.

## First release scope

- Knowledge: hotel FAQ.
- Data: simulated room types and availability.
- Tool: read-only availability lookup backed by this repo's editable `hotel.json`; no booking or human handling request is created.
- Channel: Web/RTC; real telephone integration comes later.
- Excluded: real PMS writes, payments, room keys and telephone integration.

## Failure handling

When the query tool is unavailable, answer only static policy questions and suggest contacting the front desk. Never claim a human callback or transfer was initiated. Do not promise that a room has been booked.

## Local verification

The same Next.js service exposes single-night and check-in/check-out API queries.
The rolling seven-night inventory has king, twin and family-suite counts;
the [scenario guide](README.md) lists editable fields, exact curl requests and
expected answers. The prompt provides the current hotel-local date and room IDs,
but inventory still requires the query tool. Relative date questions must be
confirmed as exact dates; checkout is excluded. Stays of 1–31 nights are accepted.
Each request resolves `dayOffset` against today in the hotel's time zone; the
default sample never expires with a calendar month. Explicit `date` records are
also supported for deliberate fixed-date tests. The moving window resets its
calendar dates at hotel-local midnight and is not a persistent booking ledger.
