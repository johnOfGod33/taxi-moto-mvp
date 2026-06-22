import { PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function getInitials(name: string) {
  const [first, second] = name.trim().split(/\s+/);
  return ((first?.[0] ?? "") + (second?.[0] ?? "")).toUpperCase();
}

function formatTogoPhone(phone: string) {
  return phone.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export function ContactRow({
  name,
  subtitle,
  phone,
}: {
  name: string;
  subtitle?: string;
  phone: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary p-4">
      <div className="flex items-center gap-3 overflow-hidden">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
        >
          {getInitials(name)}
        </span>
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span className="truncate text-base font-medium text-foreground">{name}</span>
          {subtitle && (
            <span className="truncate text-sm text-muted-foreground">{subtitle}</span>
          )}
          <span className="truncate text-sm text-muted-foreground">
            {formatTogoPhone(phone)}
          </span>
        </div>
      </div>
      <Button
        render={<a href={`tel:${phone}`} aria-label={`Appeler ${name}`} />}
        size="icon-xl"
        className="rounded-full"
      >
        <PhoneIcon aria-hidden="true" />
      </Button>
    </div>
  );
}
