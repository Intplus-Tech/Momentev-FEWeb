import { Globe, Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContactSidebarProps {
  website: string;
  email: string;
  phone: string;
  address: string;
  social: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  tags: string[];
}

export function ContactSidebar({
  website,
  email,
  phone,
  address,
  social,
  tags,
}: ContactSidebarProps) {
  return (
    <div className="bg-card rounded-2xl p-6 space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Contact Information</h3>

        <div className="space-y-3">
          {/* Website */}
          <a
            href={`https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <span className="text-primary underline group-hover:no-underline flex-1">
              {website}
            </span>
            <span className="text-muted-foreground">↗</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 text-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-foreground">{email}</span>
          </a>

          {/* Phone */}
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-foreground flex-1">{phone}</span>
            <a href={`tel:${phone}`} className="text-primary text-sm">
              Call
            </a>
          </div>

          {/* Address */}
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-foreground">{address}</span>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
        <div className="absolute inset-0 opacity-30">
          {/* Decorative map-like pattern */}
          <div className="absolute top-2 left-4 w-16 h-0.5 bg-blue-300 rounded" />
          <div className="absolute top-6 left-8 w-12 h-0.5 bg-blue-300 rounded" />
          <div className="absolute top-10 left-2 w-20 h-0.5 bg-blue-300 rounded" />
          <div className="absolute top-14 right-4 w-14 h-0.5 bg-blue-300 rounded" />
          <div className="absolute bottom-8 left-6 w-10 h-0.5 bg-blue-300 rounded" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Social media</h3>
        <div className="flex items-center gap-3">
          {social.twitter && (
            <a
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
          {social.linkedin && (
            <a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          )}
          {social.facebook && (
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          )}
          {social.instagram && (
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs font-normal text-primary border-primary/30 hover:bg-primary/10"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
