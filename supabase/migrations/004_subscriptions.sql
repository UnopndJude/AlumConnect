-- Subscription status enum
CREATE TYPE subscription_status AS ENUM ('active', 'unsubscribed')

-- Newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  preferences JSONB NOT NULL DEFAULT '{"optOutFromScraping": false, "contentPreferences": ["alumni_in_media", "member_announcements", "industry_trends"]}',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()
)

-- Indexes
CREATE INDEX idx_subscriptions_email ON newsletter_subscriptions(email)
CREATE INDEX idx_subscriptions_user_id ON newsletter_subscriptions(user_id)
CREATE INDEX idx_subscriptions_status ON newsletter_subscriptions(status)
CREATE INDEX idx_subscriptions_unsubscribe_token ON newsletter_subscriptions(unsubscribe_token)

-- RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON newsletter_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR email = auth.email())

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription" ON newsletter_subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR email = auth.email())

-- Anyone can insert (subscribe)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true)

-- Service role full access
CREATE POLICY "Service role full access subscriptions" ON newsletter_subscriptions
  FOR ALL USING (auth.role() = 'service_role')
