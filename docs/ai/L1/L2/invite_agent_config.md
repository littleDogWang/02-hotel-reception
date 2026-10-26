# Scenario Agent Configuration

> Read when changing Hotel Reception Assistant's prompt, tools, provider chain or turn detection.

## Source Files

- `lib/agent-config.ts`: role, workflow, guardrails and greeting.
- `lib/agent-config.ts`: selected prompt and default/tool mode context.
- `lib/agent-tools.ts`: optional tool origin validation, schemas and server-bound scope.
- `app/api/invite-agent/route.ts`: actual SDK builder and session options.
- `lib/runtime-profile.ts`: non-secret configured provider/model display.

There are no generic Ada/ADA_PROMPT constants to edit. Use the scenario config and prompt assembly actually imported by the invite route.

## Request And Startup

The invite body contains `requester_id` and `channel_name`.

The server reads the App ID and App Certificate, builds AgoraClient with the selected area, and creates an Agent. The configured pipeline is Deepgram nova-3, OpenAI gpt-4o-mini and MiniMax speech_2_6_turbo. Copy the route's current builder pattern and createSession options; do not add an extra client argument or reproduce older SDK signatures.

The browser and invite route share DEFAULT_AGENT_UID. RTM, transcript/error delivery and metrics remain enabled. Session startup returns the Agent ID, creation timestamp and state; ending uses that same Agent ID.

## Prompt And Tools

Default behavior: Hotel FAQ, room types and dated sample counts enter the prompt at session start. They support discussion of fictional availability without calling a business tool.

Tool behavior: `lookup_room_status` queries one occupied night at a time. Inline counts are omitted; a failed tool result cannot be replaced with fixed prompt inventory.

`lookup_room_status` calls `GET /api/scenarios/05-hotel-reception/room-status` with `room_type` and `date`. Direct API clients can instead use `check_in` and `check_out` for a 1–31-night stay. The response identifies `local_fixture` data and keeps `booking_confirmed: false`.

Availability does not create a booking. No reservation, payment, upgrade, cancellation, callback submission or human transfer is implemented. All inventory is fictional, not a live property-management feed.

## Provider And Turn Detection Changes

Edit the actual constructor blocks and turnDetection.config fields in the invite route. Provider BYOK examples are opt-in; keys stay server-side and are not part of the default two-key environment contract. For recruitment, preserve the configured 1,500 ms end-of-speech pause and 50-message LLM history unless intentionally changing interview pacing.

## Verification

Run `pnpm run verify:api`, `pnpm run verify:scenario` and canonical `pnpm run verify`. Real microphone pacing, interruptions and cloud HTTP execution require separate acceptance; mock Agent startup cannot establish those outcomes.

## See Also

- [Interfaces](../06_interfaces.md)
- [Workflows](../05_workflows.md)
- [Token model](token_model.md)
