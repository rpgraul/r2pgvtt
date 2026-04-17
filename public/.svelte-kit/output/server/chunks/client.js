import { createClient } from "@supabase/supabase-js";
import { p as public_env } from "./shared-server.js";
const supabaseUrl = public_env.PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = public_env.PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
export {
  supabase as s
};
