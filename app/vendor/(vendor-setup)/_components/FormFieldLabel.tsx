/**
 * FormFieldLabel Component
 * Displays form field labels with visual indicators for required/optional fields
 */

interface FormFieldLabelProps {
  label: string;
  isRequired?: boolean;
}

export function FormFieldLabel({ label, isRequired = true }: FormFieldLabelProps) {
  return (
    <span className="flex items-center gap-1">
      {label}
      {isRequired ? (
        <span className="text-destructive font-semibold" title="Required field">
          *
        </span>
      ) : (
        <span className="text-xs text-muted-foreground font-normal">
          (Optional)
        </span>
      )}
    </span>
  );
}
