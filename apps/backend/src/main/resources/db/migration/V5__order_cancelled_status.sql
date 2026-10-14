-- SCRUM-9 Cancel order (KAN-12): a customer can cancel their own order while it is still NEW.
-- CANCELLED is a new, final order status; the constraint lists every allowed status.

ALTER TABLE foodme."order" ADD CONSTRAINT chk_order_status
    CHECK (status IN ('NEW', 'ACCEPTED', 'DELIVERED', 'REJECTED', 'CANCELLED'));
