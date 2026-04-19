import type { ContentItem, LearningProgressRecord } from '@/stores/useAdminStore'

export const DEFAULT_PASSING_SCORE = 70
export const DEFAULT_QUESTION_COUNT = 5
export const DEFAULT_VIDEO_COUNT = 1
export const DEFAULT_MATERIAL_COUNT = 1

const MINUTES_PER_VIDEO = 12
const MINUTES_PER_MATERIAL = 8
const MINUTES_PER_ASSESSMENT_QUESTION = 2
const BASE_MODULE_MINUTES = 5
const DAILY_LEARNING_CAPACITY_MINUTES = 40

export type ModuleStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'awaiting_assessment'
  | 'failed'
  | 'approved'
  | 'overdue'

export const getVideoCount = (item: Pick<ContentItem, 'video_count'>) =>
  Math.max(1, item.video_count || DEFAULT_VIDEO_COUNT)

export const getMaterialCount = (item: Pick<ContentItem, 'material_count'>) =>
  Math.max(0, item.material_count || DEFAULT_MATERIAL_COUNT)

export const getAssessmentQuestionCount = (
  item: Pick<ContentItem, 'assessment_question_count'>,
) => Math.max(1, item.assessment_question_count || DEFAULT_QUESTION_COUNT)

export const getPassingScore = (item: Pick<ContentItem, 'passing_score'>) =>
  Math.min(100, Math.max(1, item.passing_score || DEFAULT_PASSING_SCORE))

export const getEstimatedMinutes = (
  item: Pick<
    ContentItem,
    'video_count' | 'material_count' | 'assessment_question_count' | 'estimated_minutes_override'
  >,
) => {
  if (item.estimated_minutes_override && item.estimated_minutes_override > 0) {
    return item.estimated_minutes_override
  }

  return Math.max(
    15,
    BASE_MODULE_MINUTES +
      getVideoCount(item) * MINUTES_PER_VIDEO +
      getMaterialCount(item) * MINUTES_PER_MATERIAL +
      getAssessmentQuestionCount(item) * MINUTES_PER_ASSESSMENT_QUESTION,
  )
}

export const getDeadlineDays = (
  item: Pick<
    ContentItem,
    'video_count' | 'material_count' | 'assessment_question_count' | 'estimated_minutes_override'
  >,
) => Math.max(1, Math.ceil(getEstimatedMinutes(item) / DAILY_LEARNING_CAPACITY_MINUTES))

export const getModuleXpReward = (
  item: Pick<
    ContentItem,
    'video_count' | 'material_count' | 'assessment_question_count' | 'estimated_minutes_override'
  >,
) => Math.max(60, Math.round(getEstimatedMinutes(item) * 2.2))

export const sortModules = (items: ContentItem[]) =>
  [...items].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    if (a.position !== b.position) return a.position - b.position
    return a.title.localeCompare(b.title)
  })

export const normalizeSpecialty = (value?: string | null) =>
  (value || '').trim().toLowerCase()

export const getTargetSpecialties = (item: Pick<ContentItem, 'target_specialties'>) =>
  (item.target_specialties || []).map((specialty) => normalizeSpecialty(specialty)).filter(Boolean)

export const isContentAvailableForSpecialty = (
  item: Pick<ContentItem, 'audience_scope' | 'target_specialties'>,
  specialty?: string | null,
) => {
  if (item.audience_scope !== 'specialty') return true
  const normalizedSpecialty = normalizeSpecialty(specialty)
  if (!normalizedSpecialty) return false
  return getTargetSpecialties(item).includes(normalizedSpecialty)
}

export const filterContentForSpecialty = (items: ContentItem[], specialty?: string | null) =>
  items.filter((item) => isContentAvailableForSpecialty(item, specialty))

export type ContentAccessRecord = {
  content_id: string
  is_allowed: boolean
}

export const buildContentAccessMap = (records: ContentAccessRecord[]) =>
  new Map(records.map((record) => [record.content_id, record.is_allowed]))

export const canUserAccessContent = (
  item: ContentItem,
  specialty?: string | null,
  accessMap?: Map<string, boolean>,
) => {
  const manualAccess = accessMap?.get(item.id)
  if (manualAccess !== undefined) return manualAccess
  return isContentAvailableForSpecialty(item, specialty)
}

export const filterContentForUser = (
  items: ContentItem[],
  specialty?: string | null,
  accessMap?: Map<string, boolean>,
) => items.filter((item) => item.is_published && canUserAccessContent(item, specialty, accessMap))

export const getTrackModules = (items: ContentItem[], category: string) =>
  sortModules(items.filter((item) => item.category === category))

export const buildLearningProgressMap = (records: LearningProgressRecord[]) =>
  new Map(records.map((record) => [record.content_id, record]))

export const isModuleApproved = (
  item: Pick<ContentItem, 'passing_score'>,
  record?: LearningProgressRecord | null,
) => {
  if (!record) return false
  if (record.assessment_status === 'passed') return true
  return !!record.completed_at && (record.assessment_score || 0) >= getPassingScore(item)
}

export const isModuleUnlocked = (
  trackModules: ContentItem[],
  currentIndex: number,
  progressMap: Map<string, LearningProgressRecord>,
) => {
  if (currentIndex <= 0) return true
  const previousModule = trackModules[currentIndex - 1]
  return isModuleApproved(previousModule, progressMap.get(previousModule.id))
}

export const getModuleStatus = (
  item: ContentItem,
  trackModules: ContentItem[],
  currentIndex: number,
  progressMap: Map<string, LearningProgressRecord>,
  now = new Date(),
): ModuleStatus => {
  if (!isModuleUnlocked(trackModules, currentIndex, progressMap)) return 'locked'

  const record = progressMap.get(item.id)
  if (isModuleApproved(item, record)) return 'approved'
  if (record?.assessment_status === 'failed') return 'failed'

  if (record?.due_at && new Date(record.due_at).getTime() < now.getTime()) {
    return 'overdue'
  }

  if (record?.watched_at) return 'awaiting_assessment'
  if (record?.started_at) return 'in_progress'

  return 'available'
}

export const getApprovedModulesCount = (
  modules: ContentItem[],
  progressMap: Map<string, LearningProgressRecord>,
) => modules.filter((module) => isModuleApproved(module, progressMap.get(module.id))).length

export const getTrackProgressPercent = (
  modules: ContentItem[],
  progressMap: Map<string, LearningProgressRecord>,
) => {
  if (!modules.length) return 0
  return Math.round((getApprovedModulesCount(modules, progressMap) / modules.length) * 100)
}

export const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!remainingMinutes) return `${hours}h`
  return `${hours}h ${remainingMinutes}min`
}

export const formatDeadline = (days: number) =>
  `${days} dia${days > 1 ? 's' : ''}`
