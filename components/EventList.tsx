"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../lib/actions/events";

type Event = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  [key: string]: unknown;
};

export function EventList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load events.</p>;

  const items = Array.isArray(data) ? (data as Event[]) : [];

  return (
    <ul>
      {items.map((event, index) => (
        <li key={event.id ?? event._id ?? index}>
          {event.name ?? event.title ?? "Untitled event"}
        </li>
      ))}
    </ul>
  );
}
