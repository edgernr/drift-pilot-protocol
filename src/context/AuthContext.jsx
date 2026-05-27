import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const DRIFT_REWARDS = {
  'act1-ch01': 250, 'act1-ch02': 350, 'act1-ch03': 700,
  'act1-ch04': 400, 'act1-ch05': 500, 'act1-ch06': 900,
  'act1-ch07': 550, 'act1-ch08': 1000, 'act1-ch09': 700, 'act1-ch10': 1500,
}

// Raid XP rewards (distinct from DRIFT payout amounts: 2350/1050/250/0)
export const RAID_XP_REWARDS  = { PERFECT: 500, PASSED: 300, PARTIAL: 100, FAILED: 0 }
const RAID_XP_TO_DRIFT  = { 500: 2350, 300: 1050, 100: 250, 0: 0 }
const RAID_NEW_XP_SET   = new Set([100, 300, 500])          // new-format XP values
const RAID_OLD_TO_XP    = { 2350: 500, 1050: 300, 250: 100 } // old DRIFT amounts → XP

export const XP_LEVELS = [
  { level: 1,  min: 0,    label: 'CADET',     color: 'oklch(0.55 0.08 250)'  },
  { level: 2,  min: 100,  label: 'SCOUT',     color: 'var(--teal)'           },
  { level: 3,  min: 300,  label: 'OPERATIVE', color: 'var(--violet)'         },
  { level: 4,  min: 600,  label: 'AGENT',     color: 'var(--amber)'          },
  { level: 5,  min: 1000, label: 'HUNTER',    color: 'var(--lime)'           },
  { level: 6,  min: 1600, label: 'PHANTOM',   color: 'var(--magenta)'        },
  { level: 7,  min: 2400, label: 'VANGUARD',  color: 'oklch(0.75 0.22 200)'  },
  { level: 8,  min: 3300, label: 'WARDEN',    color: 'oklch(0.72 0.20 270)'  },
  { level: 9,  min: 4200, label: 'APEX',      color: 'oklch(0.84 0.22 60)'   },
  { level: 10, min: 5000, label: 'LEGEND',    color: 'oklch(0.90 0.28 340)'  },
]

export function computeLevelData(xp) {
  let cur = XP_LEVELS[0]
  for (const lvl of XP_LEVELS) {
    if (xp >= lvl.min) cur = lvl
    else break
  }
  const next = XP_LEVELS[cur.level] // cur.level is 1-indexed; array is 0-indexed
  if (!next) return { ...cur, progress: 100, xpInLevel: 0, xpNeeded: 0, nextLabel: null }
  const xpInLevel = xp - cur.min
  const xpNeeded  = next.min - cur.min
  return { ...cur, progress: Math.round(xpInLevel / xpNeeded * 100), xpInLevel, xpNeeded, nextLabel: next.label }
}

function computeStreak(rows) {
  if (!rows?.length) return 0
  const days = [...new Set(rows.map(r => r.completed_at.slice(0, 10)))].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (days[0] !== today && days[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i - 1]) - new Date(days[i])) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  const fetchProfile = useCallback(async (userId) => {
    const [{ data: prof }, { data: xpRows, count }, { data: unlockRows }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('quest_completions').select('xp_earned,quest_id,completed_at', { count: 'exact' }).eq('user_id', userId),
      supabase.from('gate_unlocks').select('quest_id,drift_cost,unlocked_at').eq('user_id', userId),
    ])
    if (prof) {
      const isPermanentBan = prof.banned_until === '2099-01-01T00:00:00Z'
      const isTempBan = prof.banned_until && new Date(prof.banned_until) > new Date()
      if (isPermanentBan || isTempBan) {
        localStorage.setItem('dpp_ban_until', prof.banned_until)
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        return
      }
      const totalXp = xpRows?.reduce((s, r) => {
        if (r.quest_id?.startsWith('raid:')) {
          if (r.xp_earned === 0) return s
          // New format: xp_earned is actual XP (100/300/500 only)
          if (RAID_NEW_XP_SET.has(r.xp_earned)) return s + r.xp_earned
          // Old format: xp_earned was DRIFT amount — convert back to XP
          return s + (RAID_OLD_TO_XP[r.xp_earned] ?? 0)
        }
        return s + r.xp_earned
      }, 0) ?? 0
      const totalDrift = xpRows?.reduce((s, r) => {
        if (DRIFT_REWARDS[r.quest_id]) return s + DRIFT_REWARDS[r.quest_id]
        if (r.quest_id?.startsWith('raid:')) {
          if (r.xp_earned === 0) return s
          // New format: derive DRIFT from XP amount
          if (RAID_NEW_XP_SET.has(r.xp_earned)) return s + (RAID_XP_TO_DRIFT[r.xp_earned] ?? 0)
          // Old format: xp_earned IS the DRIFT amount directly
          return s + r.xp_earned
        }
        return s
      }, 0) ?? 0
      const totalDriftSpent = unlockRows?.reduce((s, r) => s + r.drift_cost, 0) ?? 0
      const completedQuestIds = new Set(xpRows?.map(r => r.quest_id) ?? [])
      const unlockedGateIds = new Set(unlockRows?.map(r => r.quest_id) ?? [])
      const streak = computeStreak(xpRows)
      const ld = computeLevelData(totalXp)
      setProfile({
        ...prof, questsCompleted: count ?? 0, totalXp, totalDrift, totalDriftSpent,
        completedQuestIds, unlockedGateIds, streak, completions: xpRows ?? [], unlocks: unlockRows ?? [],
        level: ld.level, levelLabel: ld.label, levelColor: ld.color,
        levelProgress: ld.progress, xpInLevel: ld.xpInLevel, xpNeeded: ld.xpNeeded,
        nextLevelLabel: ld.nextLabel,
      })
    }
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') { setPasswordRecovery(true); setLoading(false); return }
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
      if (event === 'INITIAL_SESSION') setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  function clearError() { setError(null) }

  async function login(email, password) {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
    return !error
  }

  async function signup(email, password, name, wallet) {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, wallet: wallet || null }, emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) setError(error.message)
    setLoading(false)
    if (error) return false
    return data.session ? 'ok' : 'confirm'
  }

  async function completeQuest(questId, xpEarned, analytics = {}) {
    if (!user) return false
    const { error } = await supabase
      .from('quest_completions')
      .upsert(
        { user_id: user.id, quest_id: questId, xp_earned: xpEarned, ...analytics },
        { onConflict: 'user_id,quest_id' }
      )
    if (!error) {
      await fetchProfile(user.id)
      supabase.functions.invoke('mint-drift', { body: { quest_id: questId } }).catch(() => {})
    }
    return !error
  }

  async function unlockGate(questId, driftCost) {
    if (!user) return { ok: false, reason: 'not-logged-in' }
    const spendable = (profile?.totalDrift ?? 0) - (profile?.totalDriftSpent ?? 0)
    if (spendable < driftCost) return { ok: false, reason: 'insufficient' }
    const { error } = await supabase.from('gate_unlocks').insert({ user_id: user.id, quest_id: questId, drift_cost: driftCost })
    if (!error) {
      await fetchProfile(user.id)
      supabase.functions.invoke('burn-drift', { body: { quest_id: questId } }).catch(() => {})
    }
    return { ok: !error, reason: error ? 'error' : null }
  }

  async function burnRaidEntry(raidId) {
    if (!user) return { ok: false, reason: 'not-logged-in' }
    const ENTRY_COST = 150
    const spendable = (profile?.totalDrift ?? 0) - (profile?.totalDriftSpent ?? 0)
    if (spendable < ENTRY_COST) return { ok: false, reason: 'insufficient' }
    const questId = `raid-entry:${raidId}`
    if (profile?.unlocks?.some(u => u.quest_id === questId)) return { ok: true, reason: null }
    const { error } = await supabase.from('gate_unlocks').insert({ user_id: user.id, quest_id: questId, drift_cost: ENTRY_COST })
    if (!error) {
      await fetchProfile(user.id)
      supabase.functions.invoke('burn-drift', { body: { quest_id: questId, reason: 'raid_entry' } }).catch(() => {})
    }
    return { ok: !error, reason: error ? 'error' : null }
  }

  async function clearFlag(targetUserId, questId) {
    if (!user || !profile?.is_admin) return false
    const { error } = await supabase
      .from('quest_completions')
      .update({ flagged: false })
      .eq('user_id', targetUserId)
      .eq('quest_id', questId)
    return !error
  }

  async function toggleSubscription(targetUserId, currentValue) {
    if (!user || !profile?.is_admin) return false
    const { error } = await supabase
      .from('profiles')
      .update({ is_subscribed: !currentValue })
      .eq('id', targetUserId)
    return !error
  }

  async function banPilot(targetUserId, duration) {
    if (!user || !profile?.is_admin) return false
    let banned_until = null
    if (duration !== 'unban') {
      if (duration === 'permanent') {
        banned_until = '2099-01-01T00:00:00Z'
      } else {
        const ms = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 }[duration]
        if (!ms) return false
        banned_until = new Date(Date.now() + ms).toISOString()
      }
    }
    const { error } = await supabase
      .from('profiles')
      .update({ banned_until })
      .eq('id', targetUserId)
    return !error
  }

  async function clearQuest(questId) {
    if (!user) return false
    const { error } = await supabase
      .from('quest_completions')
      .delete()
      .eq('user_id', user.id)
      .eq('quest_id', questId)
    if (!error) {
      const newEarned = (profile?.totalDrift ?? 0) - (DRIFT_REWARDS[questId] ?? 0)
      if (newEarned < (profile?.totalDriftSpent ?? 0)) {
        await supabase.from('gate_unlocks').delete().eq('user_id', user.id)
      }
      await fetchProfile(user.id)
    }
    return !error
  }

  async function updateProfile(name, wallet) {
    if (!user) return false
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), wallet: wallet?.trim() || null })
      .eq('id', user.id)
    if (!error) await fetchProfile(user.id)
    return !error
  }

  async function sendPasswordReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/dashboard`,
    })
    return !error
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) setPasswordRecovery(false)
    return !error
  }

  async function updateEmail(newEmail) {
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    return !error
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, passwordRecovery, clearError, login, signup, completeQuest, clearQuest, unlockGate, burnRaidEntry, clearFlag, toggleSubscription, banPilot, updateProfile, sendPasswordReset, updatePassword, updateEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
