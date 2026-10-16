# 06 Interfaces

> Contracts at repo boundaries: API routes, env vars, runtime events, and shared TypeScript payloads.

## HTTP Route Contracts

### `GET /api/generate-agora-token`

Query params:

- `uid` optional; invalid/zero resolves to random RTM-safe UID.
- `channel` optional; defaults to generated `ai-conversation-<ts>-<rand>`.

Success response:

```json
{ "token": "...", "uid": "1234", "channel": "ai-conversation-..." }
```

Failure response: `{ "error": string, "details"?: string }` with `500`.

### `POST /api/invite-agent`

Body (`ClientStartRequest`):

```json
{ "requester_id": "1234", "channel_name": "ai-conversation-..." }
```

Success (`AgentResponse`):

```json
{ "agent_id": "...", "create_ts": 1710000000, "state": "RUNNING" }
```

Validation failures return `400`; server failures return `500`.

### `POST /api/stop-conversation`

Body (`StopConversationRequest`): `{ "agent_id": "..." }`.

Responses:

- `{ "success": true }`
- `{ "success": true, "state": "already-stopping" }` for idempotent stop state
- `{ "error": string }` on failure

### `POST /api/chat/completions`

Optional SSE proxy path (not default runtime path). Requires `NEXT_LLM_API_KEY` and `NEXT_LLM_URL` when used.

## Event/Data Interfaces

### `GET /api/scenarios/05-hotel-reception/room-status`

This read-only route needs no Agora credentials and reads fictional inventory
from `scenarios/05-hotel-reception/hotel.json` in this repository.

- Single night: `room_type` and `date=YYYY-MM-DD`; returns `{ room, booking_confirmed: false, data_source: "local_fixture" }`.
- Stay: `room_type`, `check_in=YYYY-MM-DD`, `check_out=YYYY-MM-DD`; 1–31 occupied nights, checkout excluded. Do not combine with `date`.
- Stay response: `{ stay: { roomType, checkIn, checkOut, nights, missingDates, available }, booking_confirmed: false, data_source: "local_fixture" }`.
- `available` is the minimum nightly count for the stay, not a physical-room assignment. Zero inventory is a successful 200 response.
- Invalid or conflicting parameters return 400. Unknown room/date returns 404. An incomplete stay returns 404 with `available: null` and `missingDates`.
- Inventory is read from disk once per request. Invalid JSON, invalid inventory or read failures return 500 (`local_inventory_unavailable`). Changing local inventory needs no rebuild/restart; FAQ/room-type prompt configuration still needs a fresh server configuration and conversation.
- Each inventory row uses either non-negative integer `dayOffset` from hotel-local today or explicit `date`. The shipped offsets 0–6 resolve on every request, so the sample remains usable in future months/years. Responses always contain actual ISO dates. Reject duplicate resolved room/date pairs and rows setting both fields.
- Local API calls do not need `TOP_TEN_SCENARIO_TOOL_BASE_URL`. Cloud tool registration requires it to identify a reachable HTTPS origin of this same app.
- The cloud tool queries individual nights. Its description and prompt contain IDs from `hotel.json`; the prompt includes the current date in the hotel's `timeZone` and requires clarification of relative dates.
- `scripts/verify-scenario.ts` checks the hotel route and registered tool URL without cloud calls.

See the [scenario guide](../../../scenarios/05-hotel-reception/README.md) for curl requests and expected counts.

- RTM transcript/state/metrics/errors consumed through `AgoraVoiceAI` event emitter.
- Raw RTM `message` event parsed as fallback for `message.error` and `message.sal_status` payloads.
- `AGENT_METRICS` payloads displayed by `QuickstartPipelineMetrics`.

## Environment Contract

Required:

- `NEXT_PUBLIC_AGORA_APP_ID`
- `NEXT_AGORA_APP_CERTIFICATE`

This is the complete base `.env.local` contract. The optional BYOK route and provider snippets use additional variables only when a developer explicitly enables them.

Hotel scenario optional variable: `TOP_TEN_SCENARIO_TOOL_BASE_URL` is the origin
used by the cloud Agent's REST tool. It must reach this app from the cloud;
`localhost` is only suitable for direct local clients, not cloud tool execution.

## Test Coverage for Interfaces

- `scripts/verify-api-contracts.ts` asserts token generation, input validation, env failures, and SSE framing cases.

## Shared Client-Side Interfaces

From `types/conversation.ts` (high-use):

- `AgoraTokenData`: token bootstrap payload consumed by `LandingPage`.
- `AgoraRenewalTokens`: renewal callback result (`rtcToken`, `rtmToken`).
- `ConversationComponentProps`: runtime dependencies for in-call component.

## Interface Invariants

- Token payload must always include `token`, `uid`, `channel`.
- Invite route requires both `requester_id` and `channel_name`.
- Stop route requires `agent_id`; missing should never be tolerated silently.
- Token route should always return UID as string for downstream compatibility.

## Event Interface Notes

- Metrics stream entries are append-only in component state, capped to recent window.
- Connection issue records carry `source`, `agentUserId`, code/message, timestamp.
- SAL and signaling fallback payloads are parsed defensively because message schema can vary.

## Backward Compatibility Guidance

- If route response shape changes, update both client consumers and contract tests in same change.
- If adding fields, keep existing fields stable to avoid quickstart consumer breakage.
- Reflect interface changes in README and L1 docs to keep sample copyable.

## Related Deep Dives

- [conversation_lifecycle.md](L2/conversation_lifecycle.md) — How route contracts are used in sequence.
- [transcript_pipeline.md](L2/transcript_pipeline.md) — Event-level contract mapping.


## Local conversation and optional tools

Default conversations append hotel.json FAQ, room types and dated fictional room counts to the prompt. dayOffset is resolved against the hotel-local date at session start. For a stay, include check-in, exclude check-out and take the minimum nightly count; missing dates are unknown. No booking or callback is submitted. With a public HTTPS tool origin, omit inline counts and require successful room-status results; tool failure cannot fall back to fixed counts.

TOP_TEN_SCENARIO_TOOL_BASE_URL is optional. Only an explicitly configured public HTTPS endpoint enables tools; malformed, HTTP, localhost and local/private origins leave tools disabled. URL validation does not prove network reachability. No tunnel, knowledge base or database is needed for the default conversation. Local checks do not establish live speech or cloud callback acceptance.
