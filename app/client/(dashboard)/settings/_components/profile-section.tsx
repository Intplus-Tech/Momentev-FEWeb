"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, Loader2, UploadCloud } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { useUserProfile } from "@/hooks/api/use-user-profile";
import { queryKeys } from "@/lib/react-query/keys";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/user";
import { uploadFile, UploadedFile } from "@/lib/actions/upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { SectionShell } from "./section-shell";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(7, "Phone number is required"),
  dob: z.date({ message: "Date of birth is required" }),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileSection = () => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { data: user, isLoading } = useUserProfile();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const defaultValues = useMemo<ProfileFormValues>(
    () => ({
      fullName: "",
      email: "",
      phone: "",
      dob: new Date(),
      avatar: "",
    }),
    [],
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber || "",
        dob: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
        avatar: user.avatar?.url || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      let finalAvatarId = undefined;

      // Handle file upload if a new file was selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadResult = await uploadFile(formData);

        if (!uploadResult.success) {
          toast.error(uploadResult.error || "Failed to upload image");
          return;
        }
        finalAvatarId = uploadResult.data?._id;
      }

      // Split full name into first and last name (naive implementation)
      const names = values.fullName.trim().split(" ");
      const firstName = names[0];
      const lastName = names.slice(1).join(" ") || "";

      const payload: any = {
        firstName,
        lastName,
        phoneNumber: values.phone,
        dateOfBirth: values.dob ? format(values.dob, "yyyy-MM-dd") : undefined,
        ...values,
      };

      // Cleanup payload
      delete payload.fullName;
      delete payload.avatar; // handled via finalAvatarId
      delete payload.phone;
      delete payload.dob;

      if (finalAvatarId) {
        payload.avatar = finalAvatarId;
      }

      const result = await updateUserProfile(payload);

      if (result.success) {
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
        setSelectedFile(null); // Reset file selection
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const isDirty = form.formState.isDirty || !!selectedFile;
  const isSubmitting = form.formState.isSubmitting;

  const onReset = () => {
    setSelectedFile(null);
    if (user) {
      form.reset({
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber || "",
        dob: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
        avatar: user.avatar?.url || "",
      });
    }
  };

  return (
    <SectionShell title="Personal Information">
      {isLoading ? (
        <div className="flex items-center justify-center p-8 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Form {...form}>
          <form
            className="space-y-6 p-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex justify-center">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUpload
                        variant="avatar"
                        value={field.value}
                        onFileSelect={(file) => {
                          setSelectedFile(file);
                          // Update form value for preview/validation
                          if (file) {
                            try {
                              field.onChange(URL.createObjectURL(file));
                            } catch (e) {
                              // Fallback
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput label="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput
                        label="Email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput
                        label="Phone Number"
                        inputMode="tel"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    {/* <FormLabel className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </FormLabel> */}
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "justify-between font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Select date
                            </span>
                          )}
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setCalendarOpen(false);
                          }}
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                className="px-6"
                disabled={!isDirty || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
              {isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onReset}
                  disabled={isSubmitting}
                >
                  Reset Changes
                </Button>
              )}
            </div>
          </form>
        </Form>
      )}
    </SectionShell>
  );
};
