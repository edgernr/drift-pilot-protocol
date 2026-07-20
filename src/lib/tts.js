// Cutscene narration client. Calls the `tts` edge function at play time and
// plays the returned audio. Everything is best-effort: if the function isn't
// deployed / no API key / any error, all calls no-op silently and cutscenes
// play as text only. Per-session in-memory cache avoids re-invoking for a line
// already fetched (the server also caches in Storage across sessions/users).

import { supabase } from './supabase'

const MUTE_KEY = 'vs_tts_muted'
let muted = (() => { try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false } })()
let unavailable = false           // set true after the first "not configured" response
const urlCache = new Map()        // "voice:text" -> objectURL
let current = null                // currently-playing HTMLAudioElement

export function isTtsMuted() { return muted }
export function setTtsMuted(m) {
  muted = m
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0') } catch { /* ignore */ }
  if (m) stopTts()
}

function base64ToUrl(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }))
}

async function fetchClip(text, voice) {
  if (unavailable || !text) return null
  const key = `${voice}:${text}`
  if (urlCache.has(key)) return urlCache.get(key)
  try {
    const { data, error } = await supabase.functions.invoke('tts', { body: { text, voice } })
    if (error || !data?.audio) {
      // 501 not-configured (or any hard error) → stop trying this session.
      if (error) unavailable = true
      return null
    }
    const url = base64ToUrl(data.audio)
    urlCache.set(key, url)
    return url
  } catch {
    unavailable = true
    return null
  }
}

// Warm the cache for an upcoming line (reduces latency; no playback).
export function prefetchTts(text, voice = 'narrator') {
  if (!muted && !unavailable) fetchClip(text, voice)
}

export function stopTts() {
  if (current) {
    try { current.pause(); current.currentTime = 0 } catch { /* ignore */ }
    current = null
  }
}

// Speak a line. Resolves when playback ends (or immediately if unavailable/muted).
export async function speak(text, voice = 'narrator') {
  if (muted || !text) return
  stopTts()
  const url = await fetchClip(text, voice)
  if (!url || muted) return
  const audio = new Audio(url)
  current = audio
  try {
    await audio.play()             // may reject under autoplay policy before first gesture
    await new Promise((res) => { audio.onended = res; audio.onerror = res })
  } catch { /* blocked or interrupted — fine, text still shows */ }
}
