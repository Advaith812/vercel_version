export interface Reply {
  id: string;
  content: string;
  sender_id: string | null;
  created_at: string;
  is_from_visitor: boolean;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  recipient_id: string;
  is_anonymous: boolean | null;
  conversation_id: string | null;
  link_id: string | null;
  replies?: Reply[];
  read?: boolean | null;
}