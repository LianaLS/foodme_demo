import { useMutation, useQueryClient } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface CancelOrderDialogProps {
  orderNumber: string | null;
  onOpenChange: (open: boolean) => void;
}

// SCRUM-9 (KAN-13): confirm before a customer cancels an order that is still "Received".
export function CancelOrderDialog({ orderNumber, onOpenChange }: CancelOrderDialogProps) {
  return (
    <Dialog open={orderNumber !== null} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        {/* Keyed by order so an error from a previous order is not shown. */}
        {orderNumber && (
          <CancelOrderConfirm key={orderNumber} orderNumber={orderNumber} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CancelOrderConfirm({ orderNumber, onDone }: { orderNumber: string; onDone: () => void }) {
  const queryClient = useQueryClient();

  const refreshOrder = () => {
    void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["order", orderNumber] });
  };

  const mutation = useMutation({
    mutationFn: () => foodmeApi.cancelOrder(orderNumber),
    onSuccess: () => {
      refreshOrder();
      onDone();
    },
    // The kitchen may have accepted it a moment ago: show why, and load the real status.
    onError: refreshOrder,
  });

  return (
    <div>
      <DialogTitle className="font-display text-xl font-bold text-zinc-900">
        Cancel order {orderNumber}?
      </DialogTitle>
      <DialogDescription className="mt-1 text-sm text-zinc-500">This can't be undone.</DialogDescription>

      {mutation.isError && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {mutation.error instanceof Error ? mutation.error.message : "Couldn’t cancel this order."}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onDone} disabled={mutation.isPending}>
          Keep order
        </Button>
        {!mutation.isError && (
          <Button variant="destructive" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Cancelling…" : "Cancel order"}
          </Button>
        )}
      </div>
    </div>
  );
}
