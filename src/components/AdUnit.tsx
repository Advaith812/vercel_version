import { cn } from "@/lib/utils";

interface AdUnitProps {
  slot: string;
  className?: string;
}

export const AdUnit = ({ slot, className }: AdUnitProps) => {
  return (
    <div className={cn("ad-unit min-h-[100px] w-full", className)}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="YOUR-AD-CLIENT-ID" // Replace with your AdSense client ID
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};