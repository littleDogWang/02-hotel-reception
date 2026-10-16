# 05 Hotel reception

This independent Next.js app serves both the voice client and a local, read-only
room-status API. All hotel FAQ and fictional inventory are in this repository's
`hotel.json`; no sibling repository, database or external hotel system is needed.
By default, FAQ, room types and dated inventory enter the prompt. In tool mode,
inventory comes only from successful API results.

## Change the data

Edit `hotel.json`: each `rooms` item has a `roomType` ID, a non-negative integer
`available`, and either `dayOffset` or an explicit ISO `date` (`YYYY-MM-DD`).
The shipped sample uses `dayOffset`: 0 is today in the hotel's `timeZone`, 1 is
tomorrow, and so on. The API resolves these dates on every request, so the sample
still works next month or next year without regenerating JSON.

```json
{ "roomType": "standard-king", "dayOffset": 0, "available": 4 }
```

Use an explicit `date` instead of `dayOffset` only when deliberately testing a
fixed calendar date. Never set both. Keep one item per resolved room type/date;
colliding relative and fixed entries are rejected. Add new IDs to `roomTypes` so
the Agent knows which IDs it can query. Counts of zero mean sold out; absent
records mean unknown. The same JSON feeds the prompt FAQ and the query API.

The query API reads the inventory file on every request, including when using
`pnpm run start`; changing counts or dates needs no server restart. Keep the JSON
valid, counts non-negative integers, and room/date pairs unique; invalid data
returns 500 (`local_inventory_unavailable`), never invented inventory. FAQ and
room-type descriptions are imported into the Agent configuration: restart local
development and start a new conversation after changing those. On a hosted
deployment, changing the packaged JSON requires redeployment. Availability never
creates a reservation.

## Run and query locally

From this repository, run `pnpm run dev` (install dependencies first if needed).
No Agora credentials are needed for this room-status route itself.

This runnable example calculates hotel-local dates rather than hard-coding them.
Set `origin` to your local server's port if it differs from 3000.

```bash
node --input-type=module <<'JS'
const origin = 'http://localhost:3000';
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
const checkout = new Date(`${today}T00:00:00Z`);
checkout.setUTCDate(checkout.getUTCDate() + 2);
for (const query of [
  { room_type: 'standard-king', date: today },
  { room_type: 'standard-king', check_in: today, check_out: checkout.toISOString().slice(0, 10) },
]) {
  const response = await fetch(`${origin}/api/scenarios/05-hotel-reception/room-status?${new URLSearchParams(query)}`);
  console.log(response.status, await response.json());
}
JS
```

The stay response contains `stay.nights`, `stay.available` (the minimum nightly
inventory), `stay.missingDates`, `data_source: "local_fixture"`, and
`booking_confirmed: false`. This is a fictional count-based inventory model,
not an assignment of physical rooms. The single-night response keeps `room`.

Use either `date` or both `check_in` and `check_out`, never both modes. Stays must
be 1–31 nights. Invalid inputs return 400. An unknown room/date returns 404;
an incomplete stay returns 404 with `available: null` and the missing dates.
Known zero inventory returns 200 with `available: 0`.

## Expected sample inventory

| Occupied night | Standard king | Standard twin | Family suite |
| --- | ---: | ---: | ---: |
| Today (offset 0) | 4 | 3 | 1 |
| Tomorrow (offset 1) | 2 | 3 | 0 |
| Today + 2 days | 0 | 1 | 2 |
| Today + 3 days | 3 | 2 | 1 |
| Today + 4 days | 4 | 2 | 0 |
| Today + 5 days | 1 | 0 | 1 |
| Today + 6 days | 2 | 1 | 1 |

This is a moving seven-night window, not a persistent booking ledger. At each
hotel-local midnight the calendar dates move forward; the offset counts stay the
same. Dates outside the window remain unknown unless you add records for them.

| Ask | Expected result |
| --- | --- |
| Standard king, check in today, check out the day after tomorrow | 2 available across both nights; checkout is excluded |
| Family suite, same stay | Unavailable: tomorrow has zero |
| Standard twin, same stay | 3 available across both nights |
| Standard king, today + 2 days for one night | Sold out (zero) |
| Standard king, check in today + 6 days, check out today + 8 days | Unknown: today + 7 days has no record |
| Standard rooms, today until Sunday | Confirm king/twin and exact check-in/out dates before querying |
| Reserve a room or transfer me | No booking/handoff tool exists; do not claim success |

## Connect the cloud Agent

Set `TOP_TEN_SCENARIO_TOOL_BASE_URL` in `.env.local` to the reachable HTTPS origin
of this same app (deployment or tunnel). Restart the server after changing env
and start a new conversation. Local curl tests do not need this variable, but
`localhost` on your computer is not reachable by the cloud Agent.

The registered `lookup_room_status` tool queries one night at a time. For a stay,
the Agent must query every occupied night and use the minimum count. The range
query is also available directly for checking the expected result. If a configured tool fails, the Agent cannot verify inventory and must not use
fixed counts as a fallback. With no tools configured, fixed prompt inventory
supports discussion only. Neither mode can submit a booking or human transfer.

Run `pnpm run verify:scenario` for the shipped sample's local scenario/API checks,
including simulated December use, month/year transitions and hotel-local midnight.
If you change the sample counts, update its expected-answer table and assertions.
These checks do not establish successful cloud HTTP access or a real spoken conversation.


## Local conversation and optional tools

Default conversations append hotel.json FAQ, room types and dated fictional room counts to the prompt. dayOffset is resolved against the hotel-local date at session start. For a stay, include check-in, exclude check-out and take the minimum nightly count; missing dates are unknown. No booking or callback is submitted. With a public HTTPS tool origin, omit inline counts and require successful room-status results; tool failure cannot fall back to fixed counts.

TOP_TEN_SCENARIO_TOOL_BASE_URL is optional. Only an explicitly configured public HTTPS endpoint enables tools; malformed, HTTP, localhost and local/private origins leave tools disabled. URL validation does not prove network reachability. No tunnel, knowledge base or database is needed for the default conversation. Local checks do not establish live speech or cloud callback acceptance.
