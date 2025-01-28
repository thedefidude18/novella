import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserPoints(did) {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('points')
      .eq('did', did)
      .single();

    if (error) throw error;
    return data?.points || 0;
  } catch (error) {
    console.error('Error getting user points:', error);
    return 0;
  }
}

export async function addPoints(did, amount, reason = 'general') {
  try {
    const { data, error } = await supabase.rpc('add_points', {
      p_did: did,
      p_amount: amount,
      p_reason: reason
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding points:', error);
    throw error;
  }
}

export async function getPointsHistory(did) {
  try {
    const { data, error } = await supabase
      .from('points_history')
      .select('*')
      .eq('did', did)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting points history:', error);
    return [];
  }
}

export async function getLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .order('points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}