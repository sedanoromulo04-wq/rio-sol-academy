import type { Profile } from '@/stores/useUserStore'
import type { LearningProgressRecord } from '@/stores/useAdminStore'
import { ACHIEVEMENTS } from './constants'

export function getUnlockedAchievements(profile: Profile | null, learningProgress: LearningProgressRecord[]) {
  if (!profile) return ACHIEVEMENTS.map(ach => ({ ...ach, unlocked: false }))

  const modulesPassedCount = learningProgress.filter(lp => lp.assessment_status === 'passed').length

  return ACHIEVEMENTS.map(achievement => {
    let unlocked = false
    switch (achievement.id) {
      case 'arquiteto_ouro':
        unlocked = profile.xp_total >= 4000
        break
      case 'prata_eco':
        unlocked = profile.xp_total >= 2000
        break
      case 'mestre_bronze':
        unlocked = profile.xp_total >= 1000
        break
      case 'corredor_solar':
        unlocked = profile.current_streak >= 3
        break
      case 'link_neural_ia':
        unlocked = modulesPassedCount >= 5
        break
    }
    return {
      ...achievement,
      unlocked
    }
  })
}
