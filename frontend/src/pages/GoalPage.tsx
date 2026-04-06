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

  // 목표 설정 폼
  const [isEditing, setIsEditing] = useState(false)
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)

  // 확인 절차
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadGoal = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCurrentGoal()
      setGoal(res.data ?? null)
      // 목표 미설정 상태면 바로 폼 열기
      if (!res.data) setIsEditing(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoal()
  }, [])

  const handleEditClick = () => {
    setInput(goal ? String(goal.monthlyDistanceKm) : '')
    setInputError(null)
    setSaveError(null)
    setConfirming(false)
    setIsEditing(true)
  }

  const handleSaveClick = () => {
    const km = parseFloat(input)
    if (isNaN(km) || km <= 0) {
      setInputError('올바른 거리(km)를 입력해주세요.')
      return
    }
    setInputError(null)
    setConfirming(true)
  }

  const handleConfirm = async () => {
    const km = parseFloat(input)
    setSaving(true)
    setSaveError(null)
    try {
      await saveGoal(km)
      setIsEditing(false)
      setConfirming(false)
      setInput('')
      await loadGoal()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장에 실패했습니다.')
      setConfirming(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setConfirming(false)
    setInput('')
    setInputError(null)
    setSaveError(null)
  }

  const rate = Math.min(goal?.achievementRate ?? 0, 100)

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">이번 달 목표</h2>
        {goal && !isEditing && (
          <button
            onClick={handleEditClick}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            수정
          </button>
        )}
      </div>

      {/* 목표·달성률 */}
      {loading ? (
        <p className="text-gray-400 text-sm mb-3">불러오는 중...</p>
      ) : error ? (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      ) : goal && !isEditing ? (
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{goal.currentDistanceKm.toFixed(1)} km 달성</span>
            <span>목표 {goal.monthlyDistanceKm} km</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">{rate.toFixed(0)}%</p>
        </div>
      ) : !isEditing ? (
        <p className="text-gray-400 text-sm mb-3">설정된 목표가 없습니다.</p>
      ) : null}

      {/* 목표 설정 폼 */}
      {isEditing && !confirming && (
        <div className="space-y-2">
          {goal && (
            <p className="text-sm text-gray-500">
              현재 목표: <span className="font-medium">{goal.monthlyDistanceKm} km</span>
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveClick()}
              placeholder="목표 거리 (km)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            <button
              onClick={handleSaveClick}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              저장
            </button>
            {goal && (
              <button
                onClick={handleCancel}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                취소
              </button>
            )}
          </div>
          {inputError && <p className="text-red-500 text-sm">{inputError}</p>}
          {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
        </div>
      )}

      {/* 확인 절차 */}
      {confirming && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 space-y-2">
          <p className="text-sm text-amber-800">
            목표를 <span className="font-semibold">{input} km</span>로 변경하시겠습니까?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {saving ? '저장 중...' : '확인'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
