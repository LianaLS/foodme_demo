import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STARS = [1, 2, 3, 4, 5] as const;

/** Read-only stars, e.g. on a rated order. Screen readers hear "Rated 4 out of 5 stars". */
export function StarRatingDisplay({ stars, size = 16, className }: { stars: number; size?: number; className?: string }) {
  return (
    <span role="img" aria-label={`Rated ${stars} out of 5 stars`} className={cn("inline-flex items-center gap-0.5", className)}>
      {STARS.map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          size={size}
          strokeWidth={1.75}
          className={n <= stars ? "fill-amber-400 text-amber-400" : "text-zinc-300"}
        />
      ))}
    </span>
  );
}

/**
 * Star picker built on native radio buttons, so mouse, touch, keyboard (Tab + arrow keys)
 * and screen readers all work without extra wiring (spec R24).
 */
export function StarRatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (stars: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset disabled={disabled}>
      <legend className="text-[13px] font-medium leading-4 text-zinc-600">Your rating</legend>
      <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
        {STARS.map((n) => (
          <label
            key={n}
            onMouseEnter={() => setHover(n)}
            className="cursor-pointer rounded-full p-1 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900"
          >
            <input
              type="radio"
              name="stars"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              aria-label={n === 1 ? "1 star" : `${n} stars`}
              className="sr-only"
            />
            <Star
              aria-hidden="true"
              size={32}
              strokeWidth={1.5}
              className={cn(
                "transition-colors duration-100",
                n <= shown ? "fill-amber-400 text-amber-400" : "text-zinc-300",
              )}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
