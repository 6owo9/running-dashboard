import { useState, useEffect } from 'react'
import { uploadGpx, getRunningRecords } from '../api/runningApi'

interface RunningRecord {
  id: number
  title: string
  runDate: string
  distanceKm: number
  durationSeconds: number | null
}

function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}시간 ${m}분`
  return `${m}분 ${s}초`
}

function formatPace(distanceKm: number, durationSeconds: number): string {
  const paceSeconds = durationSeconds / distanceKm
  const min = Math.floor(paceSeconds / 60)
  const sec = Math.round(paceSeconds % 60)
  return `${min}'${String(sec).padStart(2, '0')}"`
}

function Calendar({ records, onFocusDate, focusDate }: { records: RunningRecord[]; onFocusDate: (date: string) => void; focusDate?: string | null }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const recordDates = new Set(records.map((r) => r.runDate))
  const todayStr = toLocalDateStr(today)
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded">‹</button>
        <span className="text-sm font-medium text-gray-700">{year}년 {month + 1}월</span>
        <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded">›</button>
      </div>
      <div className="grid grid-cols-7 text-center">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <div key={d} className="text-xs text-gray-400 pb-1">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`
          const isToday = dateStr === todayStr
          const hasRecord = recordDates.has(dateStr)
          const isFocused = dateStr === focusDate
          return (
            <div
              key={dateStr}
              className={`flex flex-col items-center py-0.5 ${hasRecord ? 'cursor-pointer' : ''}`}
              onClick={() => hasRecord && onFocusDate(dateStr)}
            >
              <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full
                ${isToday ? 'bg-blue-500 text-white font-semibold' : 'text-gray-700'}
                ${isFocused && !isToday ? 'ring-2 ring-blue-400' : ''}
                ${hasRecord && !isToday && !isFocused ? 'hover:bg-gray-100' : ''}`}>
                {day}
              </span>
              {hasRecord
                ? <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-0.5" />
                : <span className="w-1.5 h-1.5 mt-0.5" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  onFocusDate: (date: string) => void
  focusDate?: string | null
}

export default function UploadPage({ onFocusDate, focusDate }: Props) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [lastUploaded, setLastUploaded] = useState<RunningRecord | null>(null)
  const [records, setRecords] = useState<RunningRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsError, setRecordsError] = useState<string | null>(null)

  const loadRecords = async () => {
    setLoadingRecords(true)
    setRecordsError(null)
    try {
      const res = await getRunningRecords()
      setRecords(res.data ?? [])
    } catch (e) {
      setRecordsError(e instanceof Error ? e.message : '기록을 불러오지 못했습니다.')
    } finally {
      setLoadingRecords(false)
    }
  }

  useEffect(() => { loadRecords() }, [])

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setUploadError('GPX 파일만 업로드할 수 있습니다.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('파일 크기는 10MB 이하여야 합니다.')
      return
    }
    const titleFromFile = file.name.replace(/\.[^.]+$/, '')
    if (records.some((r) => r.title === titleFromFile)) {
      window.alert(`이미 같은 이름의 기록이 있습니다.\n(${titleFromFile})`)
      return
    }
    setUploading(true)
    setUploadError(null)
    setLastUploaded(null)
    try {
      const res = await uploadGpx(file)
      setLastUploaded(res.data)
      await loadRecords()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : '업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const todayStr = toLocalDateStr(new Date())
  const todayCompleted = records.some((r) => r.runDate === todayStr)

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">기록 업로드</h2>
        {todayCompleted && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            오늘 완료
          </span>
        )}
      </div>

      {/* 캘린더 */}
      <Calendar records={records} onFocusDate={onFocusDate} focusDate={focusDate} />

      {/* 업로드 영역 */}
      <label
        htmlFor="gpx-file-input"
        className="block border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          id="gpx-file-input"
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
        {uploading ? (
          <p className="text-blue-500 text-sm font-medium">업로드 중...</p>
        ) : (
          <>
            <p className="text-gray-500 text-sm">GPX 파일을 클릭하거나 드래그해서 업로드</p>
            <p className="text-gray-400 text-xs mt-1">최대 10MB · .gpx 형식</p>
          </>
        )}
      </label>

      {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}

      {/* 업로드 완료 요약 */}
      {lastUploaded && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium mb-2">업로드 완료 · {lastUploaded.runDate}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-green-600">총 거리</p>
              <p className="text-sm font-semibold text-green-800">{lastUploaded.distanceKm.toFixed(2)} km</p>
            </div>
            <div>
              <p className="text-xs text-green-600">총 시간</p>
              <p className="text-sm font-semibold text-green-800">
                {lastUploaded.durationSeconds != null ? formatDuration(lastUploaded.durationSeconds) : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-green-600">페이스</p>
              <p className="text-sm font-semibold text-green-800">
                {lastUploaded.durationSeconds != null && lastUploaded.distanceKm > 0
                  ? `${formatPace(lastUploaded.distanceKm, lastUploaded.durationSeconds)}/km`
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 기록 목록 */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">러닝 기록</h3>
        {loadingRecords ? (
          <p className="text-gray-400 text-sm">불러오는 중...</p>
        ) : recordsError ? (
          <p className="text-red-500 text-sm">{recordsError}</p>
        ) : records.length === 0 ? (
          <p className="text-gray-400 text-sm">아직 러닝 기록이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-100 max-h-52 overflow-y-auto">
            {records.map((r) => (
              <li
                key={r.id}
                className={`flex justify-between items-center py-2 pr-1 cursor-pointer rounded transition-colors ${
                  r.runDate === focusDate ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => onFocusDate(r.runDate)}
              >
                <span className="text-sm text-gray-700">{r.runDate}</span>
                <span className="text-sm text-gray-500">
                  {r.distanceKm.toFixed(2)} km
                  {r.durationSeconds != null && ` · ${formatDuration(r.durationSeconds)}`}
                  {r.durationSeconds != null && r.distanceKm > 0 && ` · ${formatPace(r.distanceKm, r.durationSeconds)}/km`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
