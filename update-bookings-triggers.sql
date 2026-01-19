-- Additional triggers for booking management flow

-- Function to notify admin when new booking is submitted
CREATE OR REPLACE FUNCTION public.notify_admin_new_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification for all admin users
    INSERT INTO notifications (user_id, type, title, message, booking_id)
    SELECT
        p.id,
        'booking_submitted',
        'New Booking Request',
        'A new booking request has been submitted and requires your review.',
        NEW.id
    FROM profiles p
    WHERE p.role = 'admin';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new booking notifications to admin
CREATE TRIGGER on_new_booking_admin_notification
    AFTER INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_booking();

-- Function to update car availability when booking status changes
CREATE OR REPLACE FUNCTION public.update_car_availability_on_booking_change()
RETURNS TRIGGER AS $$
DECLARE
    car_availability JSONB;
    new_unavailable_dates TEXT[];
    updated_availability JSONB;
BEGIN
    -- Only update availability for confirmed bookings or when status changes from confirmed
    IF (NEW.status = 'confirmed' AND OLD.status != 'confirmed') OR
       (OLD.status = 'confirmed' AND NEW.status != 'confirmed') THEN

        -- Get current availability
        SELECT availability INTO car_availability
        FROM cars
        WHERE id = NEW.car_id;

        -- Get current unavailable dates
        new_unavailable_dates := ARRAY(
            SELECT jsonb_array_elements_text(car_availability->'unavailableDates')
        );

        IF NEW.status = 'confirmed' THEN
            -- Add the booking dates to unavailable dates
            new_unavailable_dates := array_append(
                new_unavailable_dates,
                to_char(NEW.pickup_date, 'YYYY-MM-DD') || 'T' || to_char(NEW.pickup_date, 'HH24:MI:SS') || 'Z'
            );
            new_unavailable_dates := array_append(
                new_unavailable_dates,
                to_char(NEW.return_date, 'YYYY-MM-DD') || 'T' || to_char(NEW.return_date, 'HH24:MI:SS') || 'Z'
            );
        ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
            -- Remove the booking dates from unavailable dates
            new_unavailable_dates := array_remove(
                new_unavailable_dates,
                to_char(OLD.pickup_date, 'YYYY-MM-DD') || 'T' || to_char(OLD.pickup_date, 'HH24:MI:SS') || 'Z'
            );
            new_unavailable_dates := array_remove(
                new_unavailable_dates,
                to_char(OLD.return_date, 'YYYY-MM-DD') || 'T' || to_char(OLD.return_date, 'HH24:MI:SS') || 'Z'
            );
        END IF;

        -- Update the car's availability
        updated_availability := jsonb_set(
            car_availability,
            '{unavailableDates}',
            to_jsonb(new_unavailable_dates)
        );

        UPDATE cars
        SET availability = updated_availability, updated_at = NOW()
        WHERE id = NEW.car_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for car availability updates
CREATE TRIGGER on_booking_status_change_update_availability
    AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_car_availability_on_booking_change();