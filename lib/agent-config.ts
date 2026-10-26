import { getHotelLocalDate, HOTEL_TIME_ZONE } from './hotel-reception/hotel';
import hotelData from './hotel-reception/hotel.json';
import type { ScenarioConfig } from '../types/agent-config';
import { formatHotelFaqForPrompt, HOTEL_FIXTURE_VERSION, HOTEL_ROOM_TYPES } from './hotel-reception/hotel';

export const config: ScenarioConfig = {
  id: '05-hotel-reception',
  title: 'Hotel reception',
  role: 'a friendly hotel reception agent.',
  workflow: 'Answer verified hotel policy and facility questions briefly. For room availability, collect exact check-in/check-out dates and the room type. Clarify king versus twin when the user only says standard room. Use lookup_room_status for every occupied night: include check-in and exclude check-out. The stay availability is the minimum nightly count, never the sum. A missing record is unknown, not sold out. If the tool is unavailable or fails, say you cannot check availability and suggest contacting the front desk directly.',
  guardrails: 'Room-status results are fictional sample inventory, not live PMS data; explain this when quoting availability. Never promise a room, rate, booking, payment, upgrade, or cancellation without a confirmed system result. No human handoff or callback submission tool exists: never say you are transferring, have submitted a request, or ask the guest to hold for a transfer. Keep static policy answers separate from availability and reservation actions.',
  greeting: 'Welcome. How can I help with your stay?',
  fixtureSummary: `Hotel: ${hotelData.hotel}, ${hotelData.location}. Hotel fixture version ${HOTEL_FIXTURE_VERSION}. Verified FAQ:\n${formatHotelFaqForPrompt()}\nRoom types: ${HOTEL_ROOM_TYPES.map((room) => `${room.id} (${room.name})`).join('; ')}.\nRoom status requires the room-status tool; availability is not a booking.`,
};

function formatScenarioPrompt(config: ScenarioConfig): string {
  return `You are the ${config.role}

# Goal and conversation flow
${config.workflow}

# Safety and truthfulness rules
${config.guardrails}

# Demo boundary
This browser demo only has the capabilities described in this scenario. Never claim that an external action, booking, update, payment, transfer, or record write succeeded unless a configured tool returned that result.
${config.fixtureSummary ? `\n# Demo data\n${config.fixtureSummary}` : ''}`;
}

export function getScenarioConfig(): ScenarioConfig { return config; }
export function getScenarioPrompt(_scenarioId?: string, now = new Date(), toolsEnabled = false): string {
  const today = getHotelLocalDate(now);
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: HOTEL_TIME_ZONE, weekday: 'long' }).format(now);
  const inventory = toolsEnabled ? [] : (hotelData.rooms as { roomType: string; available: number; dayOffset?: number; date?: string }[]).map((room) => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + (room.dayOffset ?? 0));
    return { roomType: room.roomType, date: room.date ?? date.toISOString().slice(0, 10), available: room.available };
  });
  const promptConfig = toolsEnabled ? {
    ...config,
    guardrails: `${config.guardrails} If a tool fails, report that availability cannot be confirmed. Never substitute inline inventory or remembered sample counts for a failed tool result.`,
  } : {
    ...config,
    workflow: 'Answer hotel policy questions from the FAQ. For a stay, collect exact check-in/check-out dates and room type; clarify king versus twin. Use the dated local inventory below for every occupied night, including check-in and excluding check-out. The stay count is the minimum nightly count, never the sum. Missing dates are unknown, not sold out. Explain that these are fixed fictional counts. Collect room and date preferences and summarize them verbally; no reservation or callback can be submitted.',
    fixtureSummary: `Hotel: ${hotelData.hotel}, ${hotelData.location}. Verified FAQ:\n${formatHotelFaqForPrompt()}\nRoom types: ${JSON.stringify(hotelData.roomTypes)}\nLocal room inventory: ${JSON.stringify(inventory)}\nNo tools are configured. Do not call tools, claim live PMS access, save a request, reserve a room, or promise a transfer.`,
  };
  return `${formatScenarioPrompt(promptConfig)}\n\n# Hotel-local date\nToday is ${today} (${weekday}) in ${HOTEL_TIME_ZONE}. Resolve relative dates using this date. Confirm the exact check-in and check-out dates before checking a stay.`;
}
