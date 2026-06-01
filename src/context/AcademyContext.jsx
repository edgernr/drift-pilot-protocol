import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AcademyCtx = createContext(null)

export function AcademyProvider({ children }) {
  const { user } = useAuth()
  const [childProfiles, setChildProfiles] = useState([])
  const [activeChild, setActiveChildState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('academy_active_child')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [childCompletions, setChildCompletions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setChildProfiles([])
      setActiveChildState(null)
      setChildCompletions([])
      return
    }
    loadChildProfiles()
  }, [user?.id])

  useEffect(() => {
    if (!activeChild?.id) { setChildCompletions([]); return }
    loadChildCompletions(activeChild.id)
  }, [activeChild?.id])

  async function loadChildProfiles() {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at')
      const profiles = data ?? []
      setChildProfiles(profiles)
      // Restore activeChild, validating it still exists in DB
      setActiveChildState(prev => {
        if (prev) {
          const match = profiles.find(p => p.id === prev.id)
          if (match) return match
        }
        return profiles[0] ?? null
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadChildCompletions(childId) {
    const { data } = await supabase
      .from('academy_completions')
      .select('*')
      .eq('child_id', childId)
      .order('completed_at')
    setChildCompletions(data ?? [])
  }

  function setActiveChild(child) {
    setActiveChildState(child)
    if (child) sessionStorage.setItem('academy_active_child', JSON.stringify(child))
    else sessionStorage.removeItem('academy_active_child')
  }

  async function createChildProfile({ name, age, track, startGate, intention }) {
    if (!user) return { ok: false, error: 'Not logged in' }
    const { data, error } = await supabase
      .from('child_profiles')
      .insert({
        parent_id: user.id,
        name: name.trim(),
        age,
        track,
        start_gate: startGate,
        intention: intention ?? 'curious',
      })
      .select()
      .single()
    if (error) {
      const msg = error.message?.includes('does not exist')
        ? 'Academy setup incomplete — run academy_schema.sql in Supabase first.'
        : (error.message || 'Something went wrong.')
      return { ok: false, error: msg }
    }
    setChildProfiles(prev => [...prev, data])
    setActiveChild(data)
    return { ok: true, child: data }
  }

  async function completeAcademyGate(childId, gateId, xpEarned) {
    const { error } = await supabase
      .from('academy_completions')
      .upsert(
        { child_id: childId, gate_id: gateId, xp_earned: xpEarned },
        { onConflict: 'child_id,gate_id' }
      )
    if (!error) await loadChildCompletions(childId)
    return !error
  }

  const completedGateIds = new Set(childCompletions.map(c => c.gate_id))
  const totalAcademyXp   = childCompletions.reduce((s, c) => s + (c.xp_earned ?? 0), 0)

  return (
    <AcademyCtx.Provider value={{
      childProfiles,
      activeChild,
      setActiveChild,
      childCompletions,
      completedGateIds,
      totalAcademyXp,
      createChildProfile,
      completeAcademyGate,
      loadChildProfiles,
      loading,
    }}>
      {children}
    </AcademyCtx.Provider>
  )
}

export const useAcademy = () => useContext(AcademyCtx)
