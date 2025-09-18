
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sxkcdbnfulxzqxzpuebk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4a2NkYm5mdWx4enF4enB1ZWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTc1MzQsImV4cCI6MjA3Mzc3MzUzNH0.nMyDG--wJX3Ns6ROZW1nkg4c7GZcAECrjm0P0bcpuuA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
