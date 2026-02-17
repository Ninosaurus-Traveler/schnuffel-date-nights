const SUPABASE_URL = "https://lovfsaugxdedbatcnwun.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdmZzYXVneGRlZGJhdGNud3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTA2MzIsImV4cCI6MjA4NjkyNjYzMn0.FbhPrU7JixAHCgzdrC_sTn3E3wZpz_WXt2vS4UubXCk";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
