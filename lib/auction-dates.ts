const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function romeDateTime(raw: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
  if (!match) throw new Error("Invalid Rome date and time");
  const wanted = match.slice(1).map((part) => Number(part ?? 0));
  const base = Date.UTC(wanted[0], wanted[1] - 1, wanted[2], wanted[3], wanted[4], wanted[5]);
  const normalized = new Date(base);
  if (
    normalized.getUTCFullYear() !== wanted[0] ||
    normalized.getUTCMonth() !== wanted[1] - 1 ||
    normalized.getUTCDate() !== wanted[2] ||
    normalized.getUTCHours() !== wanted[3] ||
    normalized.getUTCMinutes() !== wanted[4] ||
    normalized.getUTCSeconds() !== wanted[5]
  ) {
    throw new Error("Invalid Rome date and time");
  }
  let timestamp = base;
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(timestamp)).map((part) => [part.type, part.value]),
    );
    const displayed = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    if (displayed === base) return new Date(timestamp);
    timestamp += base - displayed;
  }
  throw new Error("Invalid or nonexistent Rome date and time");
}

export function romeDayBounds(raw: string): { start: Date; end: Date } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("Invalid calendar date");
  const start = romeDateTime(`${raw}T00:00`);
  const [year, month, day] = raw.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  return { start, end: romeDateTime(`${next}T00:00`) };
}
