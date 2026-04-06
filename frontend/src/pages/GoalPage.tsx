import { useEffect, useState } from 'react'
import { getCurrentGoal, saveGoal } from '../api/goalApi'

interface Goal {
  monthlyDistanceKm: number
  currentDistanceKm: number
  achievementRate: number
}

export default function GoalPage() {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadGoal = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCurrentGoal()
      setGoal(res.data ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoal()
  }, [])

  const handleSave = async () => {
    const km = parseFloat(input)
    if (isNaN(km) || km <= 0) {
      setSaveError('올바른 거리(km)를 입력해주세요.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await saveGoal(km)
      setInput('')
      await loadGoal()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const rate = Math.min(goal?.achievementRate ?? 0, 100)

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="font-semibold text-gray-800 mb-3">이번 달 목표</h2>

      {/* 목표·달성률 */}
      {loading ? (
        <p className="text-gray-400 text-sm mb-3">불러오는 중...</p>
      ) : error ? (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      ) : goal ? (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{goal.currentDistanceKm.toFixed(1)} km 달성</span>
            <span>목표 {goal.monthlyDistanceKm} km</span>
          </div>
          {/* CSS 프로그레스 바 */}
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">{rate.toFixed(0)}%</p>
        </div>
      ) : (
        <p className="text-gray-400 text-sm mb-3">설정된 목표가 없습니다.</p>
      )}

      {/* 목표 설정 폼 */}
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          step="0.1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="목표 거리 (km)"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
      {saveError && <p className="text-red-500 text-sm mt-1">{saveError}</p>}
    </section>
  )
}
