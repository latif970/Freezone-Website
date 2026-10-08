// Supabase publishable anon key — safe for client-side use.
// Data access is controlled by Row Level Security (RLS) policies on the database.
var SUPABASE_URL = 'https://kdjqkwhmwmfiahmuxddl.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkanFrd2htd21maWFobXV4ZGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NjA2MjAsImV4cCI6MjEwNzAzNjYyMH0.pwePNitoBAmTlM2eCZk2SAxft8wXaALQfL-qErFpbfg';
var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
