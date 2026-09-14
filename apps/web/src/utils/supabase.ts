/**
 * @file supabase.ts
 * @description Supabase client instance used exclusively for ephemeral Realtime Broadcast & Presence.
 * No tables or persistent records are written or queried.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gjnehllvhdfpsllmiwlc.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_pYucYeHAm4WU5QwPgFhosw_aiM7B5H0";

let clientInstance: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client for ephemeral WebSocket presence and broadcasting.
 */
export function getRealtimeClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return clientInstance;
}
