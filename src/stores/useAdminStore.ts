import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'
import { buildContentAccessMap, canUserAccessContent } from '@/lib/learning'

export type ContentItem = {
  id: string
  title: string
  description: string
  video_url: string
  source_platform: 'youtube' | 'external'
  youtube_video_id: string | null
  thumbnail_url: string
  category: string
  position: number
  video_count: number
  material_count: number
  assessment_question_count: number
  passing_score: number
  estimated_minutes_override?: number | null
  audience_scope: 'all' | 'specialty'
  target_specialties: string[]
  is_published: boolean
  automation_status: 'not_configured' | 'idle' | 'queued' | 'processing' | 'ready' | 'error'
  transcript_status: 'idle' | 'queued' | 'processing' | 'ready' | 'error'
  transcript_text: string
  summary_status: 'idle' | 'queued' | 'processing' | 'ready' | 'error'
  summary_text: string
  mind_map_status: 'idle' | 'queued' | 'processing' | 'ready' | 'error'
  mind_map_markdown: string
  assessment_suggestions: string[]
  automation_requested_at: string | null
  automation_processed_at: string | null
  automation_error: string | null
}

export type Seller = {
  id: string
  name: string
  email: string
  avatar: string
  specialty?: string | null
}

export type LearningProgressRecord = {
  id: string
  user_id: string
  content_id: string
  started_at: string | null
  due_at: string | null
  watched_at: string | null
  completed_at: string | null
  assessment_score: number | null
  assessment_status: 'pending' | 'passed' | 'failed'
  attempts_count: number
  created_at: string
  updated_at: string
}

export type UserContentAccessRecord = {
  id: string
  user_id: string
  content_id: string
  is_allowed: boolean
  created_at: string
  updated_at: string
}

export type BackendEventRecord = {
  id: string
  user_id: string
  actor_id: string | null
  content_id: string | null
  action_type: string
  metadata: Record<string, any>
  created_at: string
}

export type UserProgress = {
  sellerId: string
  streakCount: number
  level: number
  totalXp: number
  overallProgress: number
  approvedModules: number
  overdueModules: number
  averageAssessmentScore: number
  activities: Array<{ id: string; title: string; type: string; date: string; score: number }>
}

type RawProfileRecord = {
  id: string
  full_name?: string | null
  email?: string | null
  specialty?: string | null
  current_streak?: number | null
  xp_total?: number | null
}

type RawActivityRecord = {
  id: string
  user_id: string
  activity_type: string
  created_at: string
  metadata?: Record<string, any> | null
  score?: number | null
}

let state = {
  content: [] as ContentItem[],
  sellers: [] as Seller[],
  progress: [] as UserProgress[],
  learningProgress: [] as LearningProgressRecord[],
  userContentAccess: [] as UserContentAccessRecord[],
  backendEvents: [] as BackendEventRecord[],
  _profilesData: [] as RawProfileRecord[],
  _activitiesData: [] as RawActivityRecord[],
  loading: false,
  initialized: false,
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

const normalizeContentItem = (item: Partial<ContentItem> & { id: string; title: string }) => ({
  id: item.id,
  title: item.title,
  description: item.description || '',
  video_url: item.video_url || '',
  source_platform: (item.source_platform === 'external' ? 'external' : 'youtube') as 'youtube' | 'external',
  youtube_video_id: item.youtube_video_id || null,
  thumbnail_url: item.thumbnail_url || '',
  category: item.category || 'Geral',
  position: item.position || 1,
  video_count: item.video_count || 1,
  material_count: item.material_count || 1,
  assessment_question_count: item.assessment_question_count || 5,
  passing_score: item.passing_score || 70,
  estimated_minutes_override: item.estimated_minutes_override || null,
  audience_scope: (item.audience_scope === 'specialty' ? 'specialty' : 'all') as 'all' | 'specialty',
  target_specialties: item.target_specialties || [],
  is_published: item.is_published === true,
  automation_status:
    item.automation_status === 'idle' ||
    item.automation_status === 'queued' ||
    item.automation_status === 'processing' ||
    item.automation_status === 'ready' ||
    item.automation_status === 'error'
      ? (item.automation_status as ContentItem['automation_status'])
      : 'not_configured',
  transcript_status:
    item.transcript_status === 'queued' ||
    item.transcript_status === 'processing' ||
    item.transcript_status === 'ready' ||
    item.transcript_status === 'error'
      ? (item.transcript_status as ContentItem['transcript_status'])
      : 'idle',
  transcript_text: item.transcript_text || '',
  summary_status:
    item.summary_status === 'queued' ||
    item.summary_status === 'processing' ||
    item.summary_status === 'ready' ||
    item.summary_status === 'error'
      ? (item.summary_status as ContentItem['summary_status'])
      : 'idle',
  summary_text: item.summary_text || '',
  mind_map_status:
    item.mind_map_status === 'queued' ||
    item.mind_map_status === 'processing' ||
    item.mind_map_status === 'ready' ||
    item.mind_map_status === 'error'
      ? (item.mind_map_status as ContentItem['mind_map_status'])
      : 'idle',
  mind_map_markdown: item.mind_map_markdown || '',
  assessment_suggestions: item.assessment_suggestions || [],
  automation_requested_at: item.automation_requested_at || null,
  automation_processed_at: item.automation_processed_at || null,
  automation_error: item.automation_error || null,
})

const mapProgressForProfiles = (
  profiles: RawProfileRecord[],
  activities: RawActivityRecord[],
  learningProgress: LearningProgressRecord[],
  contentData: Array<Partial<ContentItem> & { id: string; title: string }>,
  userContentAccess: UserContentAccessRecord[],
) =>
  (profiles || []).map((profile) => {
    const userActivities = (activities || []).filter((activity) => activity.user_id === profile.id)
    const userLearningProgress = learningProgress.filter((record) => record.user_id === profile.id)
    const accessMap = buildContentAccessMap(
      userContentAccess.filter((record) => record.user_id === profile.id),
    )
    const applicableContent = contentData
      .map((item) => normalizeContentItem(item))
      .filter((item) => canUserAccessContent(item, profile.specialty || null, accessMap))
    const applicableContentIds = new Set(applicableContent.map((item) => item.id))
    const approvedModules = userLearningProgress.filter(
      (record) => record.assessment_status === 'passed' && applicableContentIds.has(record.content_id),
    ).length
    const overdueModules = userLearningProgress.filter(
      (record) =>
        applicableContentIds.has(record.content_id) &&
        record.due_at && !record.completed_at && new Date(record.due_at).getTime() < Date.now(),
    ).length
    const assessedModules = userLearningProgress.filter(
      (record) =>
        applicableContentIds.has(record.content_id) && record.assessment_score !== null,
    )
    const averageAssessmentScore = assessedModules.length
      ? Math.round(
          assessedModules.reduce((sum, record) => sum + (record.assessment_score || 0), 0) /
            assessedModules.length,
        )
      : 0
    const overallProgress = applicableContent.length
      ? Math.round((approvedModules / applicableContent.length) * 100)
      : 0

    return {
      sellerId: profile.id,
      streakCount: profile.current_streak || 0,
      level: Math.floor((profile.xp_total || 0) / 1000) + 1,
      totalXp: profile.xp_total || 0,
      overallProgress,
      approvedModules,
      overdueModules,
      averageAssessmentScore,
      activities: userActivities.map((activity) => ({
        id: activity.id,
        title: activity.metadata?.title || `Atividade: ${activity.activity_type}`,
        type: activity.activity_type,
        date: new Date(activity.created_at).toLocaleDateString('pt-BR'),
        score: activity.score || 0,
      })),
    }
  })

const buildAdminState = (overrides: Partial<typeof state>) => {
  const nextState = {
    ...state,
    ...overrides,
  }

  return {
    ...nextState,
    progress: mapProgressForProfiles(
      nextState._profilesData,
      nextState._activitiesData,
      nextState.learningProgress,
      nextState.content,
      nextState.userContentAccess,
    ),
  }
}

async function getCurrentActorId() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

export const adminStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  init: async () => {
    if (state.initialized || state.loading) return

    state = { ...state, loading: true }
    emit()

    try {
      const [
        { data: contentData },
        { data: profiles },
        { data: activities },
        { data: learningProgress },
        { data: userContentAccess },
        { data: backendEvents },
      ] = await Promise.all([
        supabase.from('content').select('*').limit(500),
        supabase.from('profiles').select('*').limit(500),
        supabase.from('activities').select('*').limit(2000),
        supabase.from('learning_progress').select('*').limit(5000),
        supabase.from('user_content_access').select('*').limit(5000),
        supabase.from('backend_events').select('*').order('created_at', { ascending: false }).limit(200),
      ])

      const normalizedLearningProgress = (learningProgress as LearningProgressRecord[]) || []
      const sellers: Seller[] = (profiles || []).map((profile) => ({
        id: profile.id,
        name: profile.full_name || 'Usuario',
        email: profile.email || '',
        avatar: `https://img.usecurling.com/ppl/medium?seed=${profile.id}`,
        specialty: profile.specialty || null,
      }))

      state = buildAdminState({
        content: (contentData || []).map((item) =>
          normalizeContentItem(item as Partial<ContentItem> & { id: string; title: string }),
        ),
        sellers,
        learningProgress: normalizedLearningProgress,
        userContentAccess: (userContentAccess as UserContentAccessRecord[]) || [],
        backendEvents: (backendEvents as BackendEventRecord[]) || [],
        _profilesData: (profiles as RawProfileRecord[]) || [],
        _activitiesData: (activities as RawActivityRecord[]) || [],
        loading: false,
        initialized: true,
      })
      emit()
    } catch (error) {
      console.warn('Failed to load admin data', error)
      state = { ...state, loading: false }
      emit()
    }
  },
  saveContent: async (item: ContentItem) => {
    const normalizedItem = normalizeContentItem(item)
    const isExisting = state.content.find((contentItem) => contentItem.id === normalizedItem.id)

    state = buildAdminState({
      content: isExisting
        ? state.content.map((contentItem) =>
            contentItem.id === normalizedItem.id ? normalizedItem : contentItem,
          )
        : [...state.content, normalizedItem],
    })
    emit()

    try {
      await supabase.from('content').upsert([normalizedItem])
    } catch (error) {
      console.warn('Failed to save content', error)
    }

    // Auto-trigger AI pipeline whenever a YouTube video is present and not yet processed
    const shouldAutoProcess =
      normalizedItem.youtube_video_id &&
      (normalizedItem.automation_status === 'idle' ||
        normalizedItem.automation_status === 'not_configured' ||
        normalizedItem.automation_status === 'error')

    if (shouldAutoProcess) {
      const updatedItem: ContentItem = {
        ...normalizedItem,
        automation_status: 'queued',
        transcript_status: normalizedItem.transcript_status === 'ready' ? 'ready' : 'queued',
        summary_status: normalizedItem.summary_status === 'ready' ? 'ready' : 'queued',
        mind_map_status: normalizedItem.mind_map_status === 'ready' ? 'ready' : 'queued',
        automation_requested_at: new Date().toISOString(),
        automation_error: null,
      }

      state = buildAdminState({
        content: state.content.map((contentItem) =>
          contentItem.id === normalizedItem.id ? updatedItem : contentItem,
        ),
      })
      emit()

      try {
        await supabase.from('content').update({
          automation_status: 'queued',
          transcript_status: updatedItem.transcript_status,
          summary_status: updatedItem.summary_status,
          mind_map_status: updatedItem.mind_map_status,
          automation_requested_at: updatedItem.automation_requested_at,
          automation_error: null,
        }).eq('id', normalizedItem.id)
      } catch (error) {
        console.warn('Failed to queue automation', error)
      }

      supabase.functions
        .invoke('content-automation', { body: { contentId: normalizedItem.id } })
        .then(({ error }) => {
          if (error) console.warn('Auto content automation error:', error)
        })
        .catch((error) => {
          console.warn('Auto content automation trigger failed:', error)
        })
    }
  },
  deleteContent: async (id: string) => {
    state = buildAdminState({
      content: state.content.filter((contentItem) => contentItem.id !== id),
    })
    emit()

    try {
      await supabase.from('content').delete().eq('id', id)
    } catch (error) {
      console.warn('Failed to delete content', error)
    }
  },
  logBackendEvent: async (
    actionType: string,
    userId: string,
    contentId?: string | null,
    metadata: Record<string, any> = {},
  ) => {
    const actorId = await getCurrentActorId()
    const event: BackendEventRecord = {
      id: crypto.randomUUID(),
      user_id: userId,
      actor_id: actorId,
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
  updateSellerSpecialty: async (sellerId: string, specialty: string) => {
    state = buildAdminState({
      sellers: state.sellers.map((seller) =>
        seller.id === sellerId ? { ...seller, specialty: specialty || null } : seller,
      ),
      _profilesData: state._profilesData.map((profile) =>
        profile.id === sellerId ? { ...profile, specialty: specialty || null } : profile,
      ),
    })
    emit()

    try {
      await supabase
        .from('profiles')
        .update({ specialty: specialty || null })
        .eq('id', sellerId)

      await adminStore.logBackendEvent('admin_specialty_updated', sellerId, null, {
        specialty: specialty || null,
      })
    } catch (error) {
      console.warn('Failed to update seller specialty', error)
    }
  },
  setUserContentAccess: async (userId: string, contentId: string, isAllowed: boolean) => {
    const existing = state.userContentAccess.find(
      (record) => record.user_id === userId && record.content_id === contentId,
    )
    const record: UserContentAccessRecord = {
      id: existing?.id || crypto.randomUUID(),
      user_id: userId,
      content_id: contentId,
      is_allowed: isAllowed,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    state = buildAdminState({
      userContentAccess: existing
        ? state.userContentAccess.map((item) =>
            item.id === existing.id ? record : item,
          )
        : [...state.userContentAccess, record],
    })
    emit()

    try {
      await supabase.from('user_content_access').upsert([record], {
        onConflict: 'user_id,content_id',
      })

      const contentItem = state.content.find((item) => item.id === contentId)
      await adminStore.logBackendEvent('admin_content_access_updated', userId, contentId, {
        is_allowed: isAllowed,
        title: contentItem?.title || null,
      })
    } catch (error) {
      console.warn('Failed to update user content access', error)
    }
  },
  togglePublished: async (contentId: string) => {
    const existing = state.content.find((item) => item.id === contentId)
    if (!existing) return
    const nextPublished = !existing.is_published
    state = buildAdminState({
      content: state.content.map((item) =>
        item.id === contentId ? { ...item, is_published: nextPublished } : item,
      ),
    })
    emit()
    try {
      await supabase.from('content').update({ is_published: nextPublished }).eq('id', contentId)
    } catch (error) {
      console.warn('Failed to toggle published', error)
    }
  },
  requestContentAutomation: async (contentId: string) => {
    const existing = state.content.find((item) => item.id === contentId)
    if (!existing || !existing.youtube_video_id) return

    const updatedItem: ContentItem = {
      ...existing,
      automation_status: 'queued',
      transcript_status: existing.transcript_status === 'ready' ? 'ready' : 'queued',
      summary_status: existing.summary_status === 'ready' ? 'ready' : 'queued',
      mind_map_status: existing.mind_map_status === 'ready' ? 'ready' : 'queued',
      automation_requested_at: new Date().toISOString(),
      automation_error: null,
    }

    state = buildAdminState({
      content: state.content.map((item) => (item.id === contentId ? updatedItem : item)),
    })
    emit()

    try {
      await supabase
        .from('content')
        .update({
          automation_status: updatedItem.automation_status,
          transcript_status: updatedItem.transcript_status,
          summary_status: updatedItem.summary_status,
          mind_map_status: updatedItem.mind_map_status,
          automation_requested_at: updatedItem.automation_requested_at,
          automation_error: null,
        })
        .eq('id', contentId)
    } catch (error) {
      console.warn('Failed to update content status', error)
    }

    // Trigger the Supabase Edge Function to process the content pipeline
    supabase.functions
      .invoke('content-automation', { body: { contentId } })
      .then(({ error }) => {
        if (error) console.warn('Content automation edge function error:', error)
      })
      .catch((error) => {
        console.warn('Content automation trigger failed:', error)
      })
  },
  refreshContentItem: async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .single()

      if (error || !data) return null

      const normalized = normalizeContentItem(
        data as Partial<ContentItem> & { id: string; title: string },
      )

      state = buildAdminState({
        content: state.content.map((item) =>
          item.id === contentId ? normalized : item,
        ),
      })
      emit()

      return normalized
    } catch (error) {
      console.warn('Failed to refresh content item', error)
      return null
    }
  },
  clearUserContentAccess: async (userId: string, contentId: string) => {
    const existing = state.userContentAccess.find(
      (record) => record.user_id === userId && record.content_id === contentId,
    )

    if (!existing) return

    state = buildAdminState({
      userContentAccess: state.userContentAccess.filter((record) => record.id !== existing.id),
    })
    emit()

    try {
      await supabase
        .from('user_content_access')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId)

      const contentItem = state.content.find((item) => item.id === contentId)
      await adminStore.logBackendEvent('admin_content_access_reset', userId, contentId, {
        title: contentItem?.title || null,
      })
    } catch (error) {
      console.warn('Failed to clear user content access override', error)
    }
  },
}

export default function useAdminStore() {
  const current = useSyncExternalStore(adminStore.subscribe, adminStore.getSnapshot)
  return { ...current, ...adminStore }
}
