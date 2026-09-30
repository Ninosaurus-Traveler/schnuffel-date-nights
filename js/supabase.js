const SUPABASE_URL = "https://lovfsaugxdedbatcnwun.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdmZzYXVneGRlZGJhdGNud3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTA2MzIsImV4cCI6MjA4NjkyNjYzMn0.FbhPrU7JixAHCgzdrC_sTn3E3wZpz_WXt2vS4UubXCk";

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// =========================
// DATENZUGRIFF
// Die Sperre passiert serverseitig (RLS, siehe supabase/schema.sql):
// geschlossene Türchen liefern weder Inhalte noch Signed URLs.
// =========================

const supabaseApi = {
  async states() {
    const { data, error } = await supabaseClient.rpc("advent_door_states");
    if (error) throw error;
    return data;
  },

  async openDoors() {
    const { data, error } = await supabaseClient
      .from("advent_doors")
      .select("day, title, sender, message, media")
      .order("day", { ascending: true });
    if (error) throw error;
    return data;
  },

  async sign(paths) {
    if (!paths.length) return {};
    const { data, error } = await supabaseClient.storage
      .from("advent")
      .createSignedUrls(paths, 60 * 60);
    if (error) throw error;

    const urls = {};
    data.forEach(item => {
      if (item.signedUrl) urls[item.path] = item.signedUrl;
    });
    return urls;
  }
};
