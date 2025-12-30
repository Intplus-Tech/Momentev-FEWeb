"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Download, Filter, Search } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { TransactionRow } from "../data";
import { transactionFilters } from "../data";

interface TransactionHistoryTableProps {
  rows: TransactionRow[];
  meta: {
    summary: string;
    paginationLabel?: string;
  };
}

const DATE_START_INPUT_ID = "transaction-date-start";
const DATE_END_INPUT_ID = "transaction-date-end";

const columns: ColumnDef<TransactionRow>[] = [
  {
    accessorKey: "date",
    header: () => <span className="text-sm font-semibold">Date</span>,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {row.original.date}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "type",
    header: () => <span className="text-sm font-semibold">Type</span>,
    cell: ({ row }) => (
      <div className="space-y-1 text-sm">
        <p className="font-semibold text-foreground">{row.original.type}</p>
        <p className="text-xs text-muted-foreground">{row.original.subLabel}</p>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "client",
    header: () => (
      <span className="text-sm font-semibold">Client / Booking</span>
    ),
    cell: ({ row }) => (
      <p className="text-sm text-foreground">{row.original.client}</p>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "amount",
    header: () => <span className="text-sm font-semibold">Amount</span>,
    cell: ({ row }) => (
      <div className="text-sm">
        <p className="font-semibold text-foreground">{row.original.amount}</p>
        <p className="text-xs text-[#D92D20]">{row.original.fee}</p>
        <p className="text-xs text-[#078B54]">{row.original.net}</p>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: () => <span className="text-sm font-semibold">Status</span>,
    cell: ({ row }) => (
      <div className="space-y-1 text-sm">
        <Badge className="w-fit items-center gap-1 rounded-full bg-[#E6F7F1] px-3 py-1 text-[#078B54]">
          <Check className="h-3.5 w-3.5" /> {row.original.status}
        </Badge>
        <p className="text-xs text-muted-foreground">
          {row.original.statusDetail}
        </p>
      </div>
    ),
    enableSorting: false,
  },
];

export function TransactionHistoryTable({
  rows,
  meta,
}: TransactionHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateDraft, setDateDraft] = useState({ start: "", end: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 3 });

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = normalizedSearch
        ? row.client.toLowerCase().includes(normalizedSearch) ||
          row.type.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesType =
        typeFilter === "all"
          ? true
          : row.type.toLowerCase() === typeFilter.toLowerCase();
      const matchesDate =
        (!dateRange.start || row.isoDate >= dateRange.start) &&
        (!dateRange.end || row.isoDate <= dateRange.end);
      return matchesSearch && matchesType && matchesDate;
    });
  }, [rows, searchTerm, typeFilter, dateRange]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchTerm, typeFilter, dateRange]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const visibleCount = table.getRowModel().rows.length;
  const totalCount = filteredRows.length;
  const paginationLabel = totalCount
    ? `Showing ${visibleCount} out of ${totalCount} results`
    : "No results";

  const hasActiveFilters =
    typeFilter !== "all" || (dateRange.start !== "" && dateRange.end !== "");

  const handleApplyDateRange = () => {
    if (dateDraft.start && dateDraft.end && dateDraft.start > dateDraft.end) {
      setDateRange({ start: dateDraft.end, end: dateDraft.start });
      setDateDraft({ start: dateDraft.end, end: dateDraft.start });
      return;
    }
    setDateRange(dateDraft);
  };

  const handleClearFilters = () => {
    setTypeFilter("all");
    setDateRange({ start: "", end: "" });
    setDateDraft({ start: "", end: "" });
  };

  const handleExport = (format: "pdf" | "excel") => {
    console.info(`Exporting transaction history as ${format.toUpperCase()}`);
  };

  return (
    <Card className="rounded-3xl border bg-white gap-y-6 px-6 py-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Transaction History
          </p>
          <p className="text-xs text-muted-foreground">{meta.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-55">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by client, booking ID"
              className="w-full border border-border/60 bg-muted pl-10 xl:min-w-lg"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn(
                  "w-full md:w-fit",
                  hasActiveFilters &&
                    "ring-2 ring-[#BFD0FF] ring-offset-1 ring-offset-white"
                )}
              >
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-55 rounded-3xl border border-border/70 bg-white p-0 shadow-lg">
              <div className="space-y-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Transaction History Filter
                </p>
                <div className="space-y-1">
                  {transactionFilters.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (option.kind === "action") {
                          document.getElementById(DATE_START_INPUT_ID)?.focus();
                          return;
                        }
                        setTypeFilter(option.value);
                      }}
                      className={cn(
                        "w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold transition",
                        option.kind === "action" &&
                          dateRange.start &&
                          dateRange.end
                          ? "bg-[#EEF2FF] text-[#2F6BFF]"
                          : option.kind === "filter" &&
                            typeFilter === option.value
                          ? "bg-[#EEF2FF] text-[#2F6BFF]"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-3 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Date Range
                </p>
                <div className="rounded-2xl border border-border/60 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id={DATE_START_INPUT_ID}
                      type="date"
                      value={dateDraft.start}
                      onChange={(event) =>
                        setDateDraft((prev) => ({
                          ...prev,
                          start: event.target.value,
                        }))
                      }
                      className="rounded-xl"
                    />
                    <Input
                      id={DATE_END_INPUT_ID}
                      type="date"
                      value={dateDraft.end}
                      onChange={(event) =>
                        setDateDraft((prev) => ({
                          ...prev,
                          end: event.target.value,
                        }))
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <Button
                    type="button"
                    disabled={!dateDraft.start || !dateDraft.end}
                    className="mt-3 w-full rounded-full bg-[#ECECEC] text-xs font-semibold text-muted-foreground hover:bg-[#dcdcdc] disabled:opacity-60"
                    onClick={handleApplyDateRange}
                  >
                    Apply
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-[#2F6BFF] hover:text-[#1E4DCC]"
                >
                  Clear Filters
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-fit">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 rounded-3xl border border-border/70 bg-white p-2 shadow-lg">
              <p className="px-2 pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Transaction History Export
              </p>
              <DropdownMenuItem
                className="cursor-pointer rounded-2xl px-3 py-2 text-sm font-semibold"
                onSelect={(event) => {
                  event.preventDefault();
                  handleExport("pdf");
                }}
              >
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-2xl px-3 py-2 text-sm font-semibold"
                onSelect={(event) => {
                  event.preventDefault();
                  handleExport("excel");
                }}
              >
                Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original.id}
                  className="border-b border-border last:border-b-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No transactions match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{paginationLabel}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-sm font-semibold text-muted-foreground transition hover:text-primary disabled:opacity-30"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-[#1E4DCC] disabled:opacity-30"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
