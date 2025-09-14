-- Payment Integration Tables
-- Add payment-related columns and tables for AgentCeylon

-- Add payment columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS confirmation_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
ADD COLUMN IF NOT EXISTS participant_details JSONB;

-- Create payment_intents table to track Stripe payment intents
CREATE TABLE IF NOT EXISTS payment_intents (
    id VARCHAR(255) PRIMARY KEY, -- Stripe payment intent ID
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LKR',
    status VARCHAR(50) NOT NULL,
    participants INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create refunds table to track refund requests
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    payment_intent_id VARCHAR(255) REFERENCES payment_intents(id) ON DELETE CASCADE,
    stripe_refund_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(50), -- requested_by_customer, duplicate, fraudulent
    status VARCHAR(50) DEFAULT 'pending', -- pending, succeeded, failed, cancelled
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table (optional, for saving cards)
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(255) PRIMARY KEY, -- Stripe payment method ID
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- card, bank_account, etc.
    card_brand VARCHAR(20), -- visa, mastercard, etc.
    card_last4 VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table for record keeping
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LKR',
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    invoice_data JSONB, -- Store detailed invoice information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_tour_id ON payment_intents(tour_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_booking_id ON payment_intents(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(created_at);

CREATE INDEX IF NOT EXISTS idx_refunds_booking_id ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_intent_id ON refunds(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default);

CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmation_number ON bookings(confirmation_number);

-- Add triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_intents_updated_at 
    BEFORE UPDATE ON payment_intents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at 
    BEFORE UPDATE ON refunds 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for payment tables
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Payment intents policies
CREATE POLICY "Users can view own payment intents" ON payment_intents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment intents" ON payment_intents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment intents" ON payment_intents
    FOR UPDATE USING (auth.uid() = user_id);

-- Refunds policies
CREATE POLICY "Users can view own refunds" ON refunds
    FOR SELECT USING (
        auth.uid() = requested_by OR 
        auth.uid() IN (
            SELECT user_id FROM bookings WHERE id = refunds.booking_id
        )
    );

CREATE POLICY "Users can request refunds for own bookings" ON refunds
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM bookings WHERE id = refunds.booking_id
        )
    );

-- Payment methods policies
CREATE POLICY "Users can manage own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM bookings WHERE id = invoices.booking_id
        )
    );

-- Admin policies (users with admin role can access all records)
CREATE POLICY "Admins can manage all payment intents" ON payment_intents
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_type = 'admin'
        )
    );

CREATE POLICY "Admins can manage all refunds" ON refunds
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_type = 'admin'
        )
    );

CREATE POLICY "Admins can manage all invoices" ON invoices
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE user_type = 'admin'
        )
    );

-- Add some useful views
CREATE OR REPLACE VIEW booking_payment_status AS
SELECT 
    b.id,
    b.confirmation_number,
    b.user_id,
    b.tour_id,
    b.total_amount,
    b.status as booking_status,
    b.payment_status,
    b.created_at as booking_created_at,
    pi.id as payment_intent_id,
    pi.status as payment_intent_status,
    pi.created_at as payment_created_at,
    t.title as tour_title,
    t.location as tour_location,
    u.full_name as customer_name,
    u.email as customer_email
FROM bookings b
LEFT JOIN payment_intents pi ON pi.booking_id = b.id
LEFT JOIN tours t ON t.id = b.tour_id
LEFT JOIN users u ON u.id = b.user_id;

-- Grant necessary permissions
GRANT SELECT ON booking_payment_status TO authenticated;
GRANT SELECT ON booking_payment_status TO service_role;

-- Add constraints
ALTER TABLE payment_intents ADD CONSTRAINT payment_intents_amount_positive CHECK (amount > 0);
ALTER TABLE payment_intents ADD CONSTRAINT payment_intents_participants_positive CHECK (participants > 0);
ALTER TABLE refunds ADD CONSTRAINT refunds_amount_positive CHECK (amount > 0);
ALTER TABLE invoices ADD CONSTRAINT invoices_total_amount_positive CHECK (total_amount >= 0);

-- Add some helpful comments
COMMENT ON TABLE payment_intents IS 'Tracks Stripe payment intents for tour bookings';
COMMENT ON TABLE refunds IS 'Manages refund requests and their status';
COMMENT ON TABLE payment_methods IS 'Stores customer payment methods (optional)';
COMMENT ON TABLE invoices IS 'Generates and tracks invoices for bookings';
COMMENT ON VIEW booking_payment_status IS 'Consolidated view of booking and payment information';