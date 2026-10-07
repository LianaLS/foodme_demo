import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "@/components/sections/star-rating";

const REVIEW_COMMENT_MAX = 1000;

interface RateOrderDialogProps {
  orderNumber: string | null;
  onOpenChange: (open: boolean) => void;
}

export function RateOrderDialog({ orderNumber, onOpenChange }: RateOrderDialogProps) {
  return (
    <Dialog open={orderNumber !== null} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        {/* Keyed by order so the form starts empty for every order. */}
        {orderNumber && (
          <RateOrderForm key={orderNumber} orderNumber={orderNumber} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RateOrderForm({ orderNumber, onDone }: { orderNumber: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      foodmeApi.reviewOrder(orderNumber, {
        stars,
        comment: comment.trim() === "" ? null : comment.trim(),
      }),
    onSuccess: () => {
      // R17 + R12: the order shows its stars and every chef rating is fresh.
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order", orderNumber] });
      void queryClient.invalidateQueries({ queryKey: ["chef"] });
      void queryClient.invalidateQueries({ queryKey: ["chefs"] });
      onDone();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (stars > 0) mutation.mutate();
      }}
    >
      <DialogTitle className="font-display text-xl font-bold text-zinc-900">Rate order {orderNumber}</DialogTitle>
      <DialogDescription className="mt-1 text-sm text-zinc-500">
        Your rating helps other customers pick a great chef.
      </DialogDescription>

      <div className="mt-5">
        <StarRatingInput value={stars} onChange={setStars} disabled={mutation.isPending} />
      </div>

      <div className="mt-5">
        <Label htmlFor="review-comment">Comment (optional)</Label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={REVIEW_COMMENT_MAX}
          rows={4}
          placeholder="Tell us about your order"
          disabled={mutation.isPending}
          aria-describedby="review-comment-count"
          className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        />
        <p id="review-comment-count" className="mt-1 text-right text-xs tabular-nums text-zinc-400">
          {comment.length}/{REVIEW_COMMENT_MAX}
        </p>
      </div>

      {/* R18: show why it failed and keep the form so the customer can retry. */}
      {mutation.isError && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {mutation.error instanceof Error ? mutation.error.message : "Couldn’t save your rating."} Please try again.
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onDone} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={stars === 0 || mutation.isPending}>
          {mutation.isPending ? "Submitting…" : "Submit rating"}
        </Button>
      </div>
    </form>
  );
}
