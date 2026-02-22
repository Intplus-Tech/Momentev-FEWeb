"use client";

import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BriefcaseBusiness,
  RefreshCcw,
  Search,
  Tags,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { ServiceCard } from "./service-card";
import { useVendorServices } from "@/hooks/api/use-vendor-services";
import type { VendorService } from "@/types/vendor-services";

export function ServicesBoard() {
  const {
    vendorId,
    services: liveServices,
    specialties,
    isLoading,
    isError,
    refetchServices,
    refetchSpecialties,
  } = useVendorServices();

  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serviceOverrides, setServiceOverrides] = useState<
    Record<string, Partial<VendorService>>
  >({});

  const handleRefreshAll = useCallback(
    (updatedService?: Partial<VendorService> & { _id: string }) => {
      if (updatedService) {
        setServiceOverrides((prev) => ({
          ...prev,
          [updatedService._id]: {
            ...(prev[updatedService._id] || {}),
            ...updatedService,
          },
        }));
      }

      refetchServices();
      refetchSpecialties();
    },
    [refetchServices, refetchSpecialties],
  );

  const services = useMemo(() => {
    if (!liveServices) return [];
    return liveServices.map((service) => {
      const override = serviceOverrides[service._id];
      return override ? { ...service, ...override } : service;
    });
  }, [liveServices, serviceOverrides]);

  const filteredServices = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return services;

    return services.filter(
      (service) =>
        service.serviceCategory?.name?.toLowerCase().includes(normalized) ||
        service.tags?.some((tag) => tag.toLowerCase().includes(normalized)),
    );
  }, [query, services]);

  const totalServices = services.length;
  const totalSpecialties = specialties?.length ?? 0;
  const servicesWithFees = services.filter(
    (service) => (service.additionalFees?.length ?? 0) > 0,
  ).length;
  const totalTags = services.reduce(
    (sum, service) => sum + (service.tags?.length ?? 0),
    0,
  );

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchServices(), refetchSpecialties()]);
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage service configuration, specialties, tags, and fee structure.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card
              key={idx}
              className="h-28 animate-pulse rounded-2xl border bg-muted/30"
            />
          ))}
        </div>

        <Card className="rounded-2xl border p-10 text-center">
          <p className="text-muted-foreground">Loading vendor services...</p>
        </Card>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage service configuration, specialties, tags, and fee structure.
          </p>
        </div>

        <Card className="rounded-2xl border p-10 text-center">
          <p className="text-red-500">
            Failed to load services. Please try again later.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage service configuration, specialties, tags, and fee structure.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCcw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {filteredServices.map((service, index) => (
          <ServiceCard
            key={service._id}
            service={service}
            specialties={specialties || []}
            vendorId={vendorId || ""}
            expanded={
              expandedId === service._id || (expandedId === null && index === 0)
            }
            onToggle={() =>
              setExpandedId((current) =>
                current === service._id ? null : service._id,
              )
            }
            onRefreshAll={handleRefreshAll}
          />
        ))}

        {filteredServices.length === 0 && (
          <Card className="rounded-2xl border-dashed border-border bg-muted/30 p-10 text-center">
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
