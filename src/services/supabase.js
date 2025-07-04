import { createClient } from '@supabase/supabase-js';

// Direct access to your Supabase URL and key
const supabaseUrl = 'https://eqgehysjjqkqmzxzrnuy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxZ2VoeXNqanFrcW16eHpybnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMjA4NzQsImV4cCI6MjA2NjY5Njg3NH0.CAcjZsmapDP516LvI0bS-O8Gn3U2ejE2jUJq_lYnA-E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);