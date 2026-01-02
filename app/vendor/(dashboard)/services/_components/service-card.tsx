"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Service } from "../data";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

const formatCurrency = (value: number) =>
  value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });

interface ServiceCardProps {
  service: Service;
  expanded: boolean;
  onToggle: () => void;
}

export function ServiceCard({ service, expanded, onToggle }: ServiceCardProps) {
  const [active, setActive] = useState(service.status === "active");
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<string>(() =>
    expanded ? "auto" : "0px"
  );

  useEffect(() => {
    const node = contentWrapperRef.current;
    if (!node) return;

    if (expanded) {
      const scrollHeight = node.scrollHeight;
      setContainerHeight(`${scrollHeight}px`);
      const timeout = window.setTimeout(() => {
        setContainerHeight("auto");
      }, 500);

      return () => window.clearTimeout(timeout);
    }

    if (containerHeight === "auto") {
      const currentHeight = node.scrollHeight;
      setContainerHeight(`${currentHeight}px`);
      requestAnimationFrame(() => setContainerHeight("0px"));
      return;
    }

    requestAnimationFrame(() => setContainerHeight("0px"));
  }, [containerHeight, expanded]);

  return (
    <Card
      className={cn(
        "rounded-3xl border border-border p-5 transition",
        !active && "opacity-80"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={`service-panel-${service.id}`}
          className="flex items-center gap-3 text-left text-lg font-semibold text-foreground transition-colors hover:text-primary"
        >
          {service.name}
          {expanded ? (
            <ChevronUp fill="blue" className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown
              fill="blue"
              className="h-4 w-4 text-muted-foreground"
            />
          )}
        </button>
        <div className="flex items-center gap-3 text-sm">
          <span
            className={cn(
              active ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            {active ? "Active" : "Deactivated"}
          </span>
          <Switch
            checked={active}
            onCheckedChange={setActive}
            aria-label={`Toggle ${service.name}`}
          />
        </div>
      </div>

      <div
        id={`service-panel-${service.id}`}
        ref={contentWrapperRef}
        style={{ height: containerHeight }}
        className="overflow-hidden transition-[height] duration-500 ease-in-out"
      >
        <div
          className={cn(
            "mt-5 space-y-5 rounded-2xl transition-all duration-500",
            expanded ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          )}
        >
          <div className="flex flex-wrap gap-2 text-sm">
            {service.seasonality && (
              <Badge
                variant="secondary"
                className="rounded-full bg-slate-100 text-slate-700"
              >
                {service.seasonality}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="rounded-full bg-slate-100 text-slate-700"
            >
              {service.bookings} bookings
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-slate-100 text-slate-700"
            >
              {service.price}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="font-semibold text-foreground">Category:</span>{" "}
              {service.category}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Sub-Category:
              </span>{" "}
              {service.subcategory}
            </p>
            <p>
              <span className="font-semibold text-foreground">Views:</span>{" "}
              {service.viewCount}
            </p>
            <p>
              <span className="font-semibold text-foreground">Bookings:</span>{" "}
              {service.bookings}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <EditServiceDialog service={service} />
            <DeleteServiceAlert serviceName={service.name} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function EditServiceDialog({ service }: { service: Service }) {
  const [open, setOpen] = useState(false);
  const [lineItems, setLineItems] = useState<Service["lineItems"]>(
    service.lineItems
  );
  const [quoteValidity, setQuoteValidity] = useState(service.quoteValidity);
  const [personalMessage, setPersonalMessage] = useState(
    service.personalMessage
  );

  useEffect(() => {
    if (open) {
      setLineItems(service.lineItems.map((item) => ({ ...item })));
      setQuoteValidity(service.quoteValidity);
      setPersonalMessage(service.personalMessage);
    }
  }, [open, service]);

  const total = useMemo(
    () =>
      lineItems.reduce(
        (sum, item) => sum + item.quantity * item.hours * item.rate,
        0
      ),
    [lineItems]
  );

  const handleNumberChange = (
    id: string,
    field: "quantity" | "hours" | "rate",
    value: string
  ) => {
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    setLineItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: Number.isNaN(parsed) ? item[field] : Math.max(parsed, 0),
            }
          : item
      )
    );
  };

  const addLineItem = () => {
    setLineItems((items) => [
      ...items,
      {
        id: `temp-${Date.now()}`,
        name: "New Service",
        quantity: 1,
        hours: 1,
        rate: 0,
      },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-[#2F6BFF] px-6 text-white hover:bg-[#1e4dcc]">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[70vw] rounded-none max-h-[80vh] overflow-y-auto">
        <DialogHeader className="fixed w-full bg-red-400">
          <DialogTitle className="text-2xl">Service Included</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Hours</TableHead>
                  <TableHead className="text-center">Rate (/hr)</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item) => {
                  const subtotal = item.quantity * item.hours * item.rate;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          value={item.quantity}
                          onChange={(event) =>
                            handleNumberChange(
                              item.id,
                              "quantity",
                              event.target.value
                            )
                          }
                          type="number"
                          min={0}
                          className="mx-auto h-9 w-20 rounded-lg text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          value={item.hours}
                          onChange={(event) =>
                            handleNumberChange(
                              item.id,
                              "hours",
                              event.target.value
                            )
                          }
                          type="number"
                          min={0}
                          className="mx-auto h-9 w-20 rounded-lg text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          value={item.rate}
                          onChange={(event) =>
                            handleNumberChange(
                              item.id,
                              "rate",
                              event.target.value
                            )
                          }
                          type="number"
                          min={0}
                          className="mx-auto h-9 w-24 rounded-lg text-center"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatCurrency(subtotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <button
              type="button"
              onClick={addLineItem}
              className="block px-6 py-3 text-sm font-medium text-[#2F6BFF]"
            >
              + Add Service
            </button>
          </div>

          <div className="flex items-center justify-between text-lg font-semibold text-foreground">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <div className="space-y-2 text-sm text-foreground">
            <p className="font-semibold">Payment Terms:</p>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              {service.paymentTerms.map((term) => (
                <li key={term.label}>
                  {term.label}: {term.amount}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm text-foreground">Quote Validity</Label>
              <Select
                value={quoteValidity}
                onValueChange={(value) => setQuoteValidity(value)}
              >
                <SelectTrigger className="rounded-2xl border-border">
                  <SelectValue placeholder="Select validity" />
                </SelectTrigger>
                <SelectContent>
                  {service.quoteValidityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-foreground">
                Personal Message
              </Label>
              <Textarea
                value={personalMessage}
                onChange={(event) => setPersonalMessage(event.target.value)}
                className="min-h-[120px] rounded-2xl"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => setOpen(false)}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full px-5">
              Save as Draft
            </Button>
            <Button className="rounded-full bg-[#2F6BFF] px-6 text-white hover:bg-[#1e4dcc]">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteServiceAlert({ serviceName }: { serviceName: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-red-200 px-6 text-red-500 hover:bg-red-50"
        >
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete service?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove{" "}
            <span className="font-semibold text-foreground">{serviceName}</span>{" "}
            from your listings. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction className="rounded-full bg-red-500 text-white hover:bg-red-600">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
