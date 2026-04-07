import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  BackendEventRecord,
  ContentItem,
  LearningProgressRecord,
  UserContentAccessRecord,
} from '@/stores/useAdminStore'
import {
  getAssessmentQuestionCount,
  getDeadlineDays,
  getModuleXpReward,
} from '@/lib/learning'

export type Profile = {
  id: string
  full_name: string
  email: string
  avatar_url?: string | null
  specialty?: string | null
  xp_total: number
  current_streak: number
  last_activity_date: string
  is_admin: boolean
}

export type Activity = {
  id: string
  user_id: string
  activity_type: string
  score: number | null
  created_at: string
  metadata?: any
}

let state = {
  profile: null as Profile | null,
  activities: [] as Activity[],
  learningProgress: [] as LearningProgressRecord[],
  userContentAccess: [] as UserContentAccessRecord[],
  backendEvents: [] as BackendEventRecord[],
  loading: false,
  initialized: false,
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

export const userStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  init: async (userId: string) => {
    if (state.initialized || state.loading) return

    state = { ...state, loading: true }
    emit()

    try {
      const [
        { data: profile },
        { data: activities },
        { data: learningProgress },
        { data: userContentAccess },
        { data: backendEvents },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase
          .from('activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase.from('learning_progress').select('*').eq('user_id', userId),
        supabase.from('user_content_access').select('*').eq('user_id', userId),
        supabase
          .from('backend_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ])

      state = {
        ...state,
        profile: (profile as Profile) || null,
        activities: (activities as Activity[]) || [],
        learningProgress: (learningProgress as LearningProgressRecord[]) || [],
        userContentAccess: (userContentAccess as UserContentAccessRecord[]) || [],
        backendEvents: (backendEvents as BackendEventRecord[]) || [],
        loading: false,
        initialized: true,
      }
      emit()
    } catch (error) {
      console.warn('Failed to load user profile data', error)
      state = { ...state, loading: false }
      emit()
    }
  },
  logBackendEvent: async (
    actionType: string,
    contentId?: string | null,
    metadata: Record<string, any> = {},
  ) => {
    if (!state.profile) return

    const event: BackendEventRecord = {
      id: crypto.randomUUID(),
      user_id: state.profile.id,
      actor_id: state.profile.id,
      content_id: contentId || null,
      action_type: actionType,
      metadata,
      created_at: new Date().toISOString(),
    }

    state = {
      ...state,
      backendEvents: [event, ...state.backendEvents],
    }
    emit()

    try {
      await supabase.from('backend_events').insert([event])
    } catch (error) {
      console.warn('Failed to log backend event', error)
    }
  },
  updateProfile: async (payload: Partial<Profile>) => {
    if (!state.profile) return

    const nextProfile = {
      ...state.profile,
      ...payload,
    }

    state = {
      ...state,
      profile: nextProfile,
    }
    emit()

    try {
      await supabase
        .from('profiles')
        .update({
          full_name: nextProfile.full_name,
          specialty: nextProfile.specialty || null,
        })
        .eq('id', nextProfile.id)

      await userStore.logBackendEvent('profile_updated', null, {
        full_name: nextProfile.full_name,
        specialty: nextProfile.specialty || null,
      })
    } catch (error) {
      console.warn('Failed to update profile', error)
      await userStore.init(nextProfile.id)
    }
  },
  logActivity: async (type: string, score: number = 100, metadata?: Record<string, any>) => {
    if (!state.profile) return

    const activity: Activity = {
      id: crypto.randomUUID(),
      user_id: state.profile.id,
      activity_type: type,
      score,
      created_at: new Date().toISOString(),
      metadata,
    }

    const nextProfile = { ...state.profile }
    nextProfile.xp_total += score
    nextProfile.current_streak += 1
    nextProfile.last_activity_date = activity.created_at

    state = {
      ...state,
      profile: nextProfile,
      activities: [activity, ...state.activities],
    }
    emit()

    try {
      await supabase.from('activities').insert([activity])
      await supabase
        .from('profiles')
        .update({
          xp_total: nextProfile.xp_total,
          current_streak: nextProfile.current_streak,
          last_activity_date: nextProfile.last_activity_date,
        })
        .eq('id', nextProfile.id)
    } catch (error) {
      console.warn('Failed to log activity', error)
    }
  },
  upsertLearningProgressLocal: (record: LearningProgressRecord) => {
    const existing = state.learningProgress.find((item) => item.content_id === record.content_id)

    state = {
      ...state,
      learningProgress: existing
        ? state.learningProgress.map((item) =>
            item.content_id === record.content_id ? record : item,
          )
        : [...state.learningProgress, record],
    }
    emit()
  },
  startModule: async (item: ContentItem) => {
    if (!state.profile) return null

    const existing = state.learningProgress.find((record) => record.content_id === item.id) || null
    if (existing?.started_at) return existing

    const now = new Date()
    const dueAt = new Date(now)
    dueAt.setDate(dueAt.getDate() + getDeadlineDays(item))

    const record: LearningProgressRecord = {
      id: existing?.id || crypto.randomUUID(),
      user_id: state.profile.id,
      content_id: item.id,
      started_at: now.toISOString(),
      due_at: dueAt.toISOString(),
      watched_at: existing?.watched_at || null,
      completed_at: existing?.completed_at || null,
      assessment_score: existing?.assessment_score || null,
      assessment_status: existing?.assessment_status || 'pending',
      attempts_count: existing?.attempts_count || 0,
      created_at: existing?.created_at || now.toISOString(),
      updated_at: now.toISOString(),
    }

    userStore.upsertLearningProgressLocal(record)

    try {
      await supabase.from('learning_progress').upsert([record], { onConflict: 'user_id,content_id' })
      await userStore.logBackendEvent('module_started', item.id, {
        title: item.title,
        category: item.category,
      })
      return record
    } catch (error) {
      console.warn('Failed to start module', error)
      return null
    }
  },
  markModuleWatched: async (item: ContentItem) => {
    if (!state.profile) return null

    const baseRecord =
      state.learningProgress.find((record) => record.content_id === item.id) ||
      (await userStore.startModule(item))

    if (!baseRecord) return null

    const now = new Date().toISOString()
    const record: LearningProgressRecord = {
      ...baseRecord,
      watched_at: now,
      updated_at: now,
    }

    userStore.upsertLearningProgressLocal(record)

    try {
      await supabase.from('learning_progress').upsert([record], { onConflict: 'user_id,content_id' })
      await userStore.logBackendEvent('module_watched', item.id, {
        title: item.title,
        category: item.category,
      })
      return record
    } catch (error) {
      console.warn('Failed to mark module watched', error)
      return null
    }
  },
  submitAssessment: async (item: ContentItem, correctAnswers: number) => {
    if (!state.profile) return null

    const totalQuestions = getAssessmentQuestionCount(item)
    const safeCorrectAnswers = Math.min(totalQuestions, Math.max(0, correctAnswers))
    const score = Math.round((safeCorrectAnswers / totalQuestions) * 100)
    const assessmentStatus = score >= item.passing_score ? 'passed' : 'failed'

    const baseRecord =
      state.learningProgress.find((record) => record.content_id === item.id) ||
      (await userStore.startModule(item))

    if (!baseRecord) return null

    const alreadyApproved = baseRecord.assessment_status === 'passed'
    const now = new Date().toISOString()
    const record: LearningProgressRecord = {
      ...baseRecord,
      watched_at: baseRecord.watched_at || now,
      assessment_score: score,
      assessment_status: assessmentStatus,
      attempts_count: (baseRecord.attempts_count || 0) + 1,
      completed_at: assessmentStatus === 'passed' ? now : null,
      updated_at: now,
    }

    userStore.upsertLearningProgressLocal(record)

    try {
      await supabase.from('learning_progress').upsert([record], { onConflict: 'user_id,content_id' })
      await userStore.logBackendEvent('assessment_submitted', item.id, {
        title: item.title,
        category: item.category,
        score,
        status: assessmentStatus,
        attempts_count: record.attempts_count,
      })

      if (assessmentStatus === 'passed' && !alreadyApproved) {
        await userStore.logActivity('module_completion', getModuleXpReward(item), {
          content_id: item.id,
          title: item.title,
          category: item.category,
          score,
        })
        await userStore.logBackendEvent('module_approved', item.id, {
          title: item.title,
          category: item.category,
          score,
        })
      }

      if (assessmentStatus === 'failed') {
        await userStore.logBackendEvent('module_failed', item.id, {
          title: item.title,
          category: item.category,
          score,
        })
      }

      return record
    } catch (error) {
      console.warn('Failed to submit assessment', error)
      return null
    }
  },
}

export default function useUserStore() {
  const current = useSyncExternalStore(userStore.subscribe, userStore.getSnapshot)
  return { ...current, ...userStore }
}
