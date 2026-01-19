-- Update the booking status change notification trigger to work with customer_id

-- Function to create notification on booking status change
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Get user_id from customers table using customer_id
        SELECT c.user_id INTO user_id
        FROM customers c
        WHERE c.id = NEW.customer_id;

        IF user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, type, title, message, booking_id)
            VALUES (
                user_id,
                CASE
                    WHEN NEW.status = 'confirmed' THEN 'booking_approved'
                    WHEN NEW.status = 'rejected' THEN 'booking_rejected'
                    ELSE 'booking_submitted'
                END,
                CASE
                    WHEN NEW.status = 'confirmed' THEN 'Booking Confirmed!'
                    WHEN NEW.status = 'rejected' THEN 'Booking Rejected'
                    ELSE 'Booking Update'
                END,
                CASE
                    WHEN NEW.status = 'confirmed' THEN 'Your booking has been confirmed. Please proceed with payment if not already done.'
                    WHEN NEW.status = 'rejected' THEN 'Your booking has been rejected. Please contact support for more information.'
                    ELSE 'Your booking status has been updated.'
                END,
                NEW.id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is created (it should already exist, but this ensures it's up to date)
DROP TRIGGER IF EXISTS on_booking_status_change ON bookings;
CREATE TRIGGER on_booking_status_change
    AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION public.notify_booking_status_change();