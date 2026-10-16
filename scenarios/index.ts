import hotelData from './05-hotel-reception/hotel.json';
import { config as selected } from './05-hotel-reception/config';
import { formatScenarioPrompt, type ScenarioConfig } from './types';
import { formatHotelFaqForPrompt, getHotelLocalDate, HOTEL_TIME_ZONE } from './05-hotel-reception/hotel';

export function getScenarioConfig(): ScenarioConfig { return selected; }
export function getScenarioPrompt(_scenarioId?: string, now = new Date(), toolsEnabled = false): string {
  const today = getHotelLocalDate(now);
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: HOTEL_TIME_ZONE, weekday: 'long' }).format(now);
  const inventory = toolsEnabled ? [] : (hotelData.rooms as { roomType: string; available: number; dayOffset?: number; date?: string }[]).map((room) => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + (room.dayOffset ?? 0));
    return { roomType: room.roomType, date: room.date ?? date.toISOString().slice(0, 10), available: room.available };
  });
  const promptConfig = toolsEnabled ? {
    ...selected,
    guardrails: `${selected.guardrails} If a tool fails, report that availability cannot be confirmed. Never substitute inline inventory or remembered sample counts for a failed tool result.`,
  } : {
    ...selected,
    workflow: 'Answer hotel policy questions from the FAQ. For a stay, collect exact check-in/check-out dates and room type; clarify king versus twin. Use the dated local inventory below for every occupied night, including check-in and excluding check-out. The stay count is the minimum nightly count, never the sum. Missing dates are unknown, not sold out. Explain that these are fixed fictional counts. Collect room and date preferences and summarize them verbally; no reservation or callback can be submitted.',
    fixtureSummary: `Hotel: ${hotelData.hotel}, ${hotelData.location}. Verified FAQ:\n${formatHotelFaqForPrompt()}\nRoom types: ${JSON.stringify(hotelData.roomTypes)}\nLocal room inventory: ${JSON.stringify(inventory)}\nNo tools are configured. Do not call tools, claim live PMS access, save a request, reserve a room, or promise a transfer.`,
  };
  return `${formatScenarioPrompt(promptConfig)}\n\n# Hotel-local date\nToday is ${today} (${weekday}) in ${HOTEL_TIME_ZONE}. Resolve relative dates using this date. Confirm the exact check-in and check-out dates before checking a stay.`;
}
export function listScenarioConfigs(): ScenarioConfig[] { return [selected]; }
