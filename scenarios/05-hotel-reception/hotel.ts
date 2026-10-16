import hotelData from './hotel.json';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface RoomAvailability {
  roomType: string;
  date: string;
  available: number;
}

interface InventoryRecord {
  roomType: string;
  available: number;
  date?: string;
  dayOffset?: number;
}

export function getHotelLocalDate(now = new Date(), timeZone = HOTEL_TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

async function readRoomInventory(now: Date): Promise<RoomAvailability[]> {
  const contents = await readFile(path.join(process.cwd(), 'scenarios/05-hotel-reception/hotel.json'), 'utf8');
  const { rooms, timeZone } = JSON.parse(contents) as { rooms: InventoryRecord[]; timeZone: string };
  if (!Array.isArray(rooms) || rooms.some((room) =>
    !room || typeof room.roomType !== 'string' || !room.roomType.trim() ||
    !((room.dayOffset === undefined && typeof room.date === 'string' && isHotelDate(room.date)) ||
      (room.date === undefined && typeof room.dayOffset === 'number' && Number.isSafeInteger(room.dayOffset) && room.dayOffset >= 0)) ||
    !Number.isInteger(room.available) || room.available < 0)) {
    throw new Error('Invalid local hotel inventory');
  }
  const today = getHotelLocalDate(now, timeZone);
  const resolved = rooms.map((room) => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + (room.dayOffset ?? 0));
    const resolvedDate = room.date ?? date.toISOString().slice(0, 10);
    if (!isHotelDate(resolvedDate)) throw new Error('Invalid local inventory date');
    return { roomType: room.roomType.trim().toLowerCase(), date: resolvedDate, available: room.available };
  });
  const keys = resolved.map((room) => `${room.roomType}:${room.date}`);
  if (new Set(keys).size !== keys.length) throw new Error('Duplicate local hotel inventory record');
  return resolved;
}

export function isHotelDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function lookupRoomAvailability(
  roomType: string,
  date: string,
  now = new Date(),
): Promise<RoomAvailability | null> {
  const rooms = await readRoomInventory(now);
  return (
    rooms.find(
      (room) => room.roomType === roomType.trim().toLowerCase() && room.date === date,
    ) ?? null
  );
}

export async function lookupStayAvailability(roomType: string, checkIn: string, checkOut: string, now = new Date()) {
  if (!isHotelDate(checkIn) || !isHotelDate(checkOut) || checkOut <= checkIn ||
      Date.parse(checkOut) - Date.parse(checkIn) > 31 * 86_400_000) {
    throw new Error('Use valid YYYY-MM-DD dates for a stay of 1 to 31 nights');
  }
  const nights: RoomAvailability[] = [];
  const missingDates: string[] = [];
  const rooms = await readRoomInventory(now);
  const cursor = new Date(`${checkIn}T00:00:00Z`);
  while (cursor.toISOString().slice(0, 10) < checkOut) {
    const date = cursor.toISOString().slice(0, 10);
    const room = rooms.find((item) => item.roomType === roomType.trim().toLowerCase() && item.date === date);
    if (room) nights.push(room);
    else missingDates.push(date);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return {
    roomType: roomType.trim().toLowerCase(),
    checkIn,
    checkOut,
    nights,
    missingDates,
    available: missingDates.length > 0 ? null : Math.min(...nights.map((night) => night.available)),
  };
}

export function formatHotelFaqForPrompt(): string {
  return hotelData.faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n');
}

export const HOTEL_FIXTURE_VERSION = hotelData.version;
export const HOTEL_TIME_ZONE = hotelData.timeZone;
export const HOTEL_ROOM_TYPES = hotelData.roomTypes;
