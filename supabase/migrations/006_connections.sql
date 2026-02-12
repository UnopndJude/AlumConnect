-- Connection status enum
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected')

-- Connections table
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status connection_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT different_users CHECK (requester_id != receiver_id),
  CONSTRAINT unique_connection UNIQUE (requester_id, receiver_id)
)

-- Indexes
CREATE INDEX idx_connections_requester_id ON connections(requester_id)
CREATE INDEX idx_connections_receiver_id ON connections(receiver_id)
CREATE INDEX idx_connections_status ON connections(status)
CREATE INDEX idx_connections_created_at ON connections(created_at DESC)

-- RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY

-- Users can view connections where they are requester or receiver
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE id = connections.requester_id OR id = connections.receiver_id
    )
  )

-- Users can create connection requests (as requester)
CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE id = connections.requester_id
    )
  )

-- Receivers can update connections (accept/reject)
CREATE POLICY "Receivers can update connections" ON connections
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE id = connections.receiver_id
    )
  )

-- Users can delete their own connection requests (if pending)
CREATE POLICY "Requesters can delete pending connections" ON connections
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE id = connections.requester_id
    )
    AND status = 'pending'
  )

-- Service role full access
CREATE POLICY "Service role full access connections" ON connections
  FOR ALL USING (auth.role() = 'service_role')
