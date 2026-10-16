import { NextResponse } from 'next/server';
import { isHotelDate, lookupRoomAvailability, lookupStayAvailability } from '@/scenarios/05-hotel-reception/hotel';

export async function GET(request: Request) {
  try {
    return await queryRoomStatus(request);
  } catch (error) {
    console.error('Local room inventory could not be read:', error);
    return NextResponse.json({ error: 'local_inventory_unavailable' }, { status: 500 });
  }
}

async function queryRoomStatus(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const roomType = searchParams.get('room_type');
  const date = searchParams.get('date');
  const checkIn = searchParams.get('check_in');
  const checkOut = searchParams.get('check_out');
  if (checkIn !== null || checkOut !== null) {
    if (!roomType?.trim() || !checkIn || !checkOut || date !== null ||
        !isHotelDate(checkIn) || !isHotelDate(checkOut) || checkOut <= checkIn ||
        Date.parse(checkOut) - Date.parse(checkIn) > 31 * 86_400_000) {
      return NextResponse.json(
        { error: 'Use room_type and valid YYYY-MM-DD check_in/check_out dates for 1 to 31 nights; do not combine with date' },
        { status: 400 },
      );
    }
    const stay = await lookupStayAvailability(roomType, checkIn, checkOut);
    return NextResponse.json(
      { stay, booking_confirmed: false, data_source: 'local_fixture',
        ...(stay.missingDates.length > 0 ? { error: 'room_status_not_found' } : {}) },
      { status: stay.missingDates.length > 0 ? 404 : 200 },
    );
  }
  if (!roomType || !date) {
    return NextResponse.json(
      { error: 'room_type and date are required' },
      { status: 400 },
    );
  }
  if (!roomType.trim() || !isHotelDate(date)) {
    return NextResponse.json({ error: 'Use a non-empty room_type and a valid YYYY-MM-DD date' }, { status: 400 });
  }
  const room = await lookupRoomAvailability(roomType, date);
  return room
    ? NextResponse.json({ room, booking_confirmed: false, data_source: 'local_fixture' })
    : NextResponse.json({ error: 'room_status_not_found' }, { status: 404 });
}
