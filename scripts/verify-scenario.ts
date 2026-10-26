import { getScenarioConfig, getScenarioPrompt } from '../lib/agent-config';
import assert from 'node:assert/strict';
import { GET } from '../app/api/scenarios/05-hotel-reception/room-status/route';
import { getScenarioTools } from '../lib/agent-tools';
import { getHotelLocalDate, lookupRoomAvailability, lookupStayAvailability } from '../lib/hotel-reception/hotel';
const config = getScenarioConfig();
if (config.id !== '05-hotel-reception') throw new Error(`Expected 05-hotel-reception, got ${config.id}`);
for (const field of ['role', 'workflow', 'guardrails']) { if (!config[field as keyof typeof config]) throw new Error(`Missing ${field}`); }
if (!getScenarioPrompt().includes('# Goal and conversation flow')) throw new Error('Scenario prompt was not formatted');
console.log(`Scenario config passed: ${config.id}`);

async function verifyRoomStatus() {
  const baseUrl = 'http://localhost:3000';
  const path = '/api/scenarios/05-hotel-reception/room-status';
  const today = getHotelLocalDate();
  const day = (offset: number) => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  };
  const cases: [string, number][] = [
    ['', 400],
    [`?room_type=standard-king&date=${day(0)}`, 200],
    [`?room_type=standard-king&date=${day(2)}`, 200],
    [`?room_type=unknown&date=${day(0)}`, 404],
    [`?room_type=standard-king&date=${day(7)}`, 404],
    ['?room_type=standard-king&date=2026-02-30', 400],
    [`?room_type=standard-king&check_in=${day(0)}`, 400],
    [`?room_type=standard-king&check_in=${day(2)}&check_out=${day(0)}`, 400],
    [`?room_type=standard-king&check_in=${day(0)}&check_out=${day(0)}`, 400],
    [`?room_type=standard-king&check_in=${day(0)}&check_out=${day(32)}`, 400],
    [`?room_type=standard-king&date=${day(0)}&check_in=${day(0)}&check_out=${day(2)}`, 400],
  ];
  for (const [query, status] of cases) {
    const response = await GET(new Request(`${baseUrl}${path}${query}`));
    assert.equal(response.status, status, query);
  }

  const single = await GET(new Request(`${baseUrl}${path}?room_type=standard-king&date=${day(2)}`));
  const singleBody = await single.json();
  assert.equal(singleBody.room.available, 0, 'Sold out is a known zero, not a missing record');
  assert.equal(singleBody.booking_confirmed, false);

  for (const [roomType, expected] of [['standard-king', 2], ['standard-twin', 3], ['family-suite', 0]] as const) {
    const response = await GET(new Request(`${baseUrl}${path}?room_type=${roomType}&check_in=${day(0)}&check_out=${day(2)}`));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.stay.available, expected, 'Use the minimum count across occupied nights');
    assert.deepEqual(body.stay.nights.map((night: { date: string }) => night.date), [day(0), day(1)], 'Exclude the checkout night');
    assert.equal(body.booking_confirmed, false);
    assert.equal(body.data_source, 'local_fixture');
  }

  const incomplete = await GET(new Request(`${baseUrl}${path}?room_type=standard-king&check_in=${day(6)}&check_out=${day(8)}`));
  const incompleteBody = await incomplete.json();
  assert.equal(incomplete.status, 404);
  assert.equal(incompleteBody.stay.available, null, 'Missing inventory must not become zero or a partial success');
  assert.deepEqual(incompleteBody.stay.missingDates, [day(7)]);

  assert.deepEqual(getScenarioTools(config.id, ''), []);
  assert.deepEqual(getScenarioTools(config.id, baseUrl), [], 'Localhost must not register a cloud tool');
  const [tool] = getScenarioTools(config.id, `https://hotel.example.com/`);
  const url = tool.server.url.replace('{{args.room_type}}', 'standard-king').replace('{{args.date}}', day(0));
  const toolResponse = await GET(new Request(url));
  assert.equal((await toolResponse.json()).room.available, 4, 'The registered tool URL must point to the local handler');

  const prompt = getScenarioPrompt(config.id, new Date('2026-10-16T02:00:00Z'));
  assert(prompt.includes('2026-10-15 (Thursday)'), 'Use the hotel-local date, not the UTC date');
  assert(prompt.includes('\"date\":\"2026-10-15\"') && prompt.includes('\"available\":4'), 'Default prompt must contain dated fixture inventory');
  const toolPrompt = getScenarioPrompt(config.id, new Date('2026-10-16T02:00:00Z'), true);
  assert(!toolPrompt.includes('Local room inventory:') && toolPrompt.includes('Never substitute inline inventory'), 'Tool mode must not mask a failed lookup with local counts');
  assert(prompt.includes('standard-twin'), 'Expose room IDs and local inventory in default mode');

  for (const [clock, checkIn, checkOut] of [
    ['2026-12-15T05:00:00Z', '2026-12-15', '2026-12-17'],
    ['2026-11-30T05:00:00Z', '2026-11-30', '2026-12-02'],
    ['2026-12-31T05:00:00Z', '2026-12-31', '2027-01-02'],
  ]) {
    const now = new Date(clock);
    const stay = await lookupStayAvailability('standard-king', checkIn, checkOut, now);
    assert.equal(stay.available, 2, `Rolling sample inventory must work in December and across boundaries: ${clock}`);
    assert.equal(stay.nights[0].available, 4);
    assert.equal(stay.nights[1].available, 2);
    assert.deepEqual(stay.missingDates, []);
  }
  const afterMidnight = new Date('2027-01-01T05:30:00Z');
  assert.equal(getHotelLocalDate(afterMidnight), '2027-01-01');
  assert.equal((await lookupRoomAvailability('standard-king', '2027-01-01', afterMidnight))?.available, 4);
  assert(getScenarioPrompt(config.id, afterMidnight).includes('2027-01-01 (Friday)'));
  assert.equal(getHotelLocalDate(new Date('2026-07-01T04:30:00Z')), '2026-07-01', 'Summer uses EDT');
  assert.equal(getHotelLocalDate(new Date('2026-12-01T04:30:00Z')), '2026-11-30', 'Winter uses EST');
  console.log('Hotel room-status checks passed: rolling inventory, December, month/year boundaries, single nights, stays, unknown data, validation, and tool URL');
}

verifyRoomStatus().catch((error) => { console.error(error); process.exitCode = 1; });
