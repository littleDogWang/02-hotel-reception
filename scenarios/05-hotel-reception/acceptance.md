# Hotel reception acceptance criteria

## Required checks

- Static FAQ questions receive direct answers.
- Availability questions invoke the simulated lookup and use its response.
- Missing room types or failed lookups do not produce fabricated availability.
- For booking requests, the Agent explains that no booking has been created and suggests contacting the front desk.
- The Agent never claims it has submitted a callback or initiated a human transfer.
- A stay includes check-in and excludes checkout; availability is the minimum nightly count.
- Local HTTP results match the editable `hotel.json`; missing records are unknown, not zero.

## Suggested cases

1. Ask about check-in time and breakfast policy.
2. Check availability for a specified date.
3. Request a room type with no availability.
4. Simulate a PMS mock timeout.
5. Request a reservation and confirm that neither a booking nor a human callback is claimed.
6. Check standard king rooms from today to the day after tomorrow: two rooms across two occupied nights.
7. Check family suites for the same stay: zero due to tomorrow being sold out.
8. Check today + 6 days to today + 8 days: unknown because today + 7 days has no record.
9. Modify an inventory count in `hotel.json` during local development; repeat the HTTP query and verify the changed count, then restore the fixture.
10. Simulate December, month/year boundaries and hotel-local midnight; the same offset counts must resolve to the corresponding calendar dates without modifying JSON.

## Evidence

- FAQ/availability fixtures.
- Tool responses and final statements.
- Local HTTP responses and `pnpm run verify:scenario` output.
- Actual cloud tool calls and spoken transcripts remain separate acceptance work.
