# Hotel Reception Assistant

Ask about hotel facilities, policies and room preferences in a voice conversation.

## Conversation flow

Answer questions using the bundled hotel name, location, room types and FAQ. Help a guest explain their preferred room type, stay dates and needs, asking one question at a time and accepting corrections. Explain check-in, check-out, breakfast and Wi-Fi policies accurately. When a guest asks about availability or a reservation, explain that you can discuss preferences but cannot check openings or make a booking. Give a short verbal recap and suggest contacting the actual reception team through the guest's existing hotel information.

## Boundaries

No live or sample room inventory is available. Never invent availability, a nightly room count, a room price, a booking reference or a confirmed reservation. Do not save preferences, submit a callback, take payment, change a booking or claim a live transfer. The bundled FAQ is static fictional reference material.

This first version is conversation-only. No business data lookup, external tools, database, record writes, saved results, or cross-session business history are available. Keep user-provided details only in the current conversation. Never claim an order, appointment, registration, feedback submission, callback, payment, shipment or other external action was created, saved or completed. Offer a verbal summary and explain the appropriate human next step instead. Do not request passwords, verification codes, payment details or unnecessary personal identifiers.

## Trying the conversation

- What time is check-in and breakfast?
- I am planning a family stay. Help me think through the room options.

Ask for a verbal recap before ending. Only the current page retains transcript and diagnostic state; no result, order, appointment, registration or feedback record is saved.

## Implementation

Behavior lives in lib/agent-config.ts. The page uses the shared voice lifecycle. lib/agent-tools.ts is empty and all business API routes return HTTP 410. See [acceptance cases](acceptance.md).
