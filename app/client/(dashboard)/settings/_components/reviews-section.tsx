import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Link as LinkIcon, Loader2, MessageSquare, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useClientReviews, useDeleteReview, useUpdateReview } from "@/hooks/api/use-client-reviews";
import { useUserProfile } from "@/hooks/api/use-user-profile";
import { ClientActionBlockedDialog } from "@/components/shared/client-action-blocked-dialog";

import { SectionShell } from "./section-shell";

type CustomerReviewVendor = {
  _id: string;
  rate?: number;
  profilePhoto?: {
    url?: string;
  };
  businessProfile?: {
    businessName?: string;
  };
};

type CustomerReviewItem = {
  _id: string;
  rating: number;
  comment?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  vendorId: CustomerReviewVendor | string;
};

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(5, "Review must be at least 5 characters").max(1000, "Review is too long"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

type ReviewEditDialogProps = {
  review: CustomerReviewItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ReviewFormValues) => Promise<void>;
  isPending: boolean;
};

function ReviewEditDialog({ review, open, onOpenChange, onSubmit, isPending }: ReviewEditDialogProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: review?.rating ?? 0,
      comment: review?.comment ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      rating: review?.rating ?? 0,
      comment: review?.comment ?? "",
    });
  }, [form, review]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
          <DialogDescription>
            Update your rating or feedback for this completed booking.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="sr-only">Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transition-transform hover:scale-110"
                          onClick={() => field.onChange(star)}
                        >
                          <Star
                            className={`h-8 w-8 ${star <= field.value ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience..."
                      className="min-h-30 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const ReviewsSection = () => {
  const { data: user } = useUserProfile();
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 20;
  const { data: reviewsData, isLoading, isFetching } = useClientReviews(user?._id, page, PAGE_LIMIT);

  // Accumulate paginated reviews
  const [accumulatedReviews, setAccumulatedReviews] = useState<CustomerReviewItem[]>([]);
  const totalReviewsCount = reviewsData?.total;

  // Append new page of reviews when it arrives
  useEffect(() => {
    if (reviewsData && Array.isArray(reviewsData.data)) {
      const incoming = reviewsData.data as CustomerReviewItem[];
      setAccumulatedReviews((prev) => {
        const existingIds = new Set(prev.map((r) => r._id));
        const toAppend = incoming.filter((r) => !existingIds.has(r._id));
        if (toAppend.length === 0) return prev;
        return [...prev, ...toAppend];
      });
    }
  }, [reviewsData]);

  // Reset accumulated reviews when user changes
  useEffect(() => {
    setAccumulatedReviews([]);
    setPage(1);
  }, [user?._id]);
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const reviews = accumulatedReviews.length > 0 ? accumulatedReviews : ((reviewsData?.data || []) as CustomerReviewItem[]);
  const [selectedReview, setSelectedReview] = useState<CustomerReviewItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerReviewItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const [blockedRestriction, setBlockedRestriction] = useState<any | null>(null);

  const openEdit = (review: CustomerReviewItem) => {
    setSelectedReview(review);
    setEditOpen(true);
  };

  const openDelete = (review: CustomerReviewItem) => {
    setDeleteTarget(review);
    setDeleteOpen(true);
  };

  const handleEditSubmit = async (values: ReviewFormValues) => {
    if (!selectedReview) return;

    const vendor = typeof selectedReview.vendorId === "string" ? null : selectedReview.vendorId;

    try {
      await updateReview.mutateAsync({
        reviewId: selectedReview._id,
        rating: values.rating,
        comment: values.comment,
        vendorId: vendor?._id,
        bookingId: selectedReview.bookingId,
      });
      toast.success("Review updated successfully");
      setEditOpen(false);
      setSelectedReview(null);
    } catch (error) {
      const err: any = error;
      if (err?.restriction) {
        setBlockedRestriction(err.restriction);
        setShowBlockedDialog(true);
        return;
      }
      toast.error(error instanceof Error ? error.message : "Failed to update review");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const vendor = typeof deleteTarget.vendorId === "string" ? null : deleteTarget.vendorId;

    try {
      await deleteReview.mutateAsync({
        reviewId: deleteTarget._id,
        vendorId: vendor?._id,
        bookingId: deleteTarget.bookingId,
      });
      toast.success("Review deleted successfully");
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      const err: any = error;
      if (err?.restriction) {
        setBlockedRestriction(err.restriction);
        setShowBlockedDialog(true);
        return;
      }
      toast.error(error instanceof Error ? error.message : "Failed to delete review");
    }
  };

  if (isLoading) {
    return (
      <SectionShell title="Reviews">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title={`${reviewsData?.total || 0} Reviews`}>
      <div className="space-y-4 p-4 xl:min-h-[45vh]">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">No reviews yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              You have not reviewed any completed bookings yet. Open a completed booking to leave a review and keep everything connected to the booking.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => {
              const vendor = typeof review.vendorId === "string" ? null : review.vendorId;
              const vendorName = vendor?.businessProfile?.businessName || "Vendor";
              const vendorInitials = vendorName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={review._id}
                  className="space-y-4 rounded-xl border border-border/50 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="hidden h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary md:flex mt-2">
                      {index + 1}
                    </span>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {vendor?.profilePhoto?.url ? (
                              <AvatarImage src={vendor.profilePhoto.url} alt={vendorName} />
                            ) : (
                              <AvatarFallback>{vendorInitials || "V"}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{vendorName}</p>
                            <p className="text-xs text-muted-foreground">
                              Reviewed on {format(new Date(review.createdAt), "MMMM d, yyyy")}
                              {review.isEdited ? " · edited" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-3 w-3 ${idx < review.rating ? "fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {review.comment || "No written comment was added for this review."}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {review.bookingId ? (
                          <Button asChild variant="secondary" size="sm" className="gap-2">
                            <Link href={`/client/bookings/${review.bookingId}`}>
                              <LinkIcon className="h-4 w-4" />
                              View booking
                            </Link>
                          </Button>
                        ) : null}

                        <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(review)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>

                        <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => openDelete(review)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>

                        {vendor?.rate ? (
                          <span className="text-xs text-muted-foreground">
                            Vendor rating: {vendor.rate.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {totalReviewsCount !== undefined && reviews.length < totalReviewsCount && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={isFetching}>
              {isFetching ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </div>

      <ReviewEditDialog
        review={selectedReview}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedReview(null);
        }}
        onSubmit={handleEditSubmit}
        isPending={updateReview.isPending}
      />

      <AlertDialog open={deleteOpen} onOpenChange={(open) => {
        setDeleteOpen(open);
        if (!open) setDeleteTarget(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your review for this booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReview.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteReview.isPending}
            >
              {deleteReview.isPending ? "Deleting..." : "Delete review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ClientActionBlockedDialog
        open={showBlockedDialog}
        onOpenChange={(open) => {
          if (!open) setBlockedRestriction(null);
          setShowBlockedDialog(open);
        }}
        restriction={blockedRestriction}
      />
    </SectionShell>
  );
};
