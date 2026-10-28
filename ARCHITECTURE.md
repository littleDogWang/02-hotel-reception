# Hotel Reception Assistant Architecture

## System Overview

A hotel reception voice assistant for a fictional Boston hotel. Guests can ask about policies and facilities, specify a room type and dates, and discuss sample availability across a stay. The recipe includes an editable seven-night rolling inventory and a read-only room-status API.

One Next.js process owns the browser application and its HTTP routes. Agora cloud owns the managed STT → LLM → TTS pipeline; the browser is not a local speech/model runtime. The default provider configuration is recorded in the invite route and `lib/runtime-profile.ts`.

## Component Topology

```text
Browser microphone <-> Agora RTC <-> managed Agent
Browser transcript <- Agora RTM <- managed Agent
Browser -- HTTPS --> Next.js token / invite / stop routes
Agent -- optional public HTTPS --> same Next.js scenario routes
Scenario routes -> read-only local fixtures
```

## Request And Event Flow

1. The user's start action bootstraps scenario state when needed, then fetches a combined RTC/RTM token.
2. The browser logs into/subscribes to RTM and invites the managed Agent. The invite body contains `requester_id` and `channel_name`.
3. RTC hooks join and publish the microphone after the StrictMode guard; the toolkit binds both transports.
4. Audio travels over RTC. Transcript, Agent state, errors and reported latency travel over RTM.
5. `lookup_room_status` calls `GET /api/scenarios/02-hotel-reception/room-status` with `room_type` and `date`. Direct API clients can instead use `check_in` and `check_out` for a 1–31-night stay. The response identifies `local_fixture` data and keeps `booking_confirmed: false`.
6. Renewal keeps the joined RTC UID, RTM login UID and channel consistent.
7. Ending stops the Agent, logs out RTM and unmounts hook-owned RTC/microphone resources. Retained evidence is not itself a saved business result.

## Ownership Boundaries

- `components/LandingPage.tsx`: browser startup, RTM bootstrap, renewal and end orchestration.
- `components/ConversationComponent.tsx`: RTC/microphone hooks, toolkit events and transcript snapshots.
- `app/api/generate-agora-token/route.ts`: RTM-capable token creation.
- `app/api/invite-agent/route.ts`: privileged Agent configuration and startup.
- `lib/hotel-reception/`: source of truth for scenario-specific rules and data.
- `lib/agent-tools.ts`: available tools, parameter schemas and server-bound call scope.
- `lib/conversation.ts`: transcript UID/text normalization.

## Authentication And Secrets

The App Certificate stays in the Next.js server environment. Tokens are scoped/expiring; the browser receives tokens rather than the certificate. The public App ID is embedded into the client build and must match the server's project. Sample endpoints do not implement production user authentication. Business capabilities/session IDs limit example scope where implemented; they are not real customer/patient identity verification.

## Runtime Modes

Local development runs one Next.js process at http://localhost:3000 using `.env.local`. Native production uses `pnpm run build` then `pnpm run start`. Docker runs the same app as non-root UID 1001 on port 3000, without a reverse proxy inside the image. The voice app and read-only inventory route can share a Next.js deployment. The route reads packaged hotel.json on each request. Editing inventory on a writable local server is visible to API calls without restart; changing a hosted bundle requires redeployment. Start a fresh conversation after prompt-data changes.

```bash
docker build --build-arg NEXT_PUBLIC_AGORA_APP_ID=YOUR_AGORA_APP_ID -t 02-hotel-reception:local .
docker run --rm -p 3000:3000 --env-file .env.local 02-hotel-reception:local
```

Replace `YOUR_AGORA_APP_ID` with the public App ID used in `.env.local`. Next.js embeds that identifier in the browser bundle, so changing projects requires rebuilding the image. The App Certificate is supplied only at container runtime. A container restart does not preserve process memory. This image does not add a shared state service.

`pnpm run verify:docker` independently builds the image with synthetic credentials, starts an isolated localhost-bound container, checks the home page and a scenario route, then removes only that container. It does not contact Agora or prove a live voice session.

## API And External Contracts

The invite body contains `requester_id` and `channel_name`.

The token route returns `{ token, uid, channel }`; stop accepts `{ agent_id }` and handles an already-stopping session idempotently. Hotel FAQ, room types and dated sample counts enter the prompt at session start. They support discussion of fictional availability without calling a business tool. `lookup_room_status` queries one occupied night at a time. Inline counts are omitted; a failed tool result cannot be replaced with fixed prompt inventory.

See [Interfaces](docs/ai/L1/06_interfaces.md), [internal recipe](docs/ai/RECIPE.md) and [scenario guide](docs/scenario/README.md) for contracts. Static checks, native startup, Docker startup and complete live speech/tool outcomes are separate evidence.
