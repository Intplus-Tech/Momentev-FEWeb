"use client";

import { useMemo, useState } from "react";

import type { Service } from "../data";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { ServiceCard } from "./service-card";

export function ServicesBoard({ services }: { services: Service[] }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    const defaultService = services.find((svc) => svc.defaultOpen);
    return defaultService ? defaultService.id : null;
  });

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return services;
    return services.filter((service) =>
      service.name.toLowerCase().includes(normalized)
    );
  }, [query, services]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Manage service offerings and portfolio
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Services</h1>
      </div>

      <div className="flex items-center justify-between gap-3 w-full">
        <Button>+ Add New Service</Button>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name"
              className="w-full xl:min-w-xl border border-transparent  focus:border-primary/50 pl-12 focus:bg-white"
            />
          </div>
          <Button className="bg-[#2F6BFF] px-4 text-white hover:bg-[#1e4dcc]">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            expanded={expandedId === service.id}
            onToggle={() =>
              setExpandedId((current) =>
                current === service.id ? null : service.id
              )
            }
          />
        ))}
        {filtered.length === 0 && (
          <Card className="border-dashed border-border bg-muted/30 p-10 text-center">
            <p className="text-base font-medium text-foreground">
              No services found
            </p>
            <p className="text-sm text-muted-foreground">
              Try another search keyword.
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}
