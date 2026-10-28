# 02 Architecture

> Topology and state ownership for Hotel Reception Assistant.

## Components

One Next.js App Router process serves the browser and routes. RTC carries audio; RTM carries transcript, Agent state, metrics and errors. The server SDK manages the cloud STT/LLM/TTS Agent. Scenario files define the business behavior.

## Data And Event Flow

The user start action creates any necessary scenario session, fetches the combined RTC/RTM token and bootstraps RTM plus invite. RTC/microphone hooks wait for the StrictMode guard. Toolkit events feed transcript and Inspector. Renew both token identities consistently; end calls stop, logs out RTM and unmounts hook-owned resources.

The invite body contains `requester_id` and `channel_name`.

`lookup_room_status` calls `GET /api/scenarios/02-hotel-reception/room-status` with `room_type` and `date`. Direct API clients can instead use `check_in` and `check_out` for a 1–31-night stay. The response identifies `local_fixture` data and keeps `booking_confirmed: false`.

## Ownership Boundaries

LandingPage owns pre-call bootstrap/RTM; ConversationComponent owns joined RTC/toolkit subscriptions. Token/invite/stop routes own privileged operations. `lib/hotel-reception/` owns business rules/data; tool-contracts owns server-bound tool execution scope. Session evidence and manually selected outcomes are not automatic proof of business completion.

## Runtime Modes

Local development runs one Next.js process at http://localhost:3000 using `.env.local`. Native production uses `pnpm run build` then `pnpm run start`. Docker runs the same app as non-root UID 1001 on port 3000, without a reverse proxy inside the image. The voice app and read-only inventory route can share a Next.js deployment. The route reads packaged hotel.json on each request. Editing inventory on a writable local server is visible to API calls without restart; changing a hosted bundle requires redeployment. Start a fresh conversation after prompt-data changes.

Docker embeds the public App ID at build and receives the certificate only at runtime. It copies the actual runtime fixtures and supplies a non-root-owned data directory. File-backed scenarios require a retained writable volume; process-local scenarios require a single long-lived process. See [full architecture](../../../ARCHITECTURE.md).

## Related Deep Dives

- [Lifecycle](L2/conversation_lifecycle.md)
- [Tokens](L2/token_model.md)
