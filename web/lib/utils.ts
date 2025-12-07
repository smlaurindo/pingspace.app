import { clsx, type ClassValue } from "clsx";
import { format, isThisWeek, isToday, isYesterday, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const userLocale = typeof navigator !== "undefined" ? navigator.language : "en-US";
const dateFormatter = new Intl.DateTimeFormat(userLocale, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return format(date, "HH:mm");
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  if (isThisWeek(date, { weekStartsOn: 0 })) {
    return format(date, "EEEE");
  }

  return dateFormatter.format(date);
}
