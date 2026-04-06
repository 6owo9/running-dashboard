import { useState, useEffect } from 'react'
import { uploadGpx, getRunningRecords } from '../api/runningApi'

interface RunningRecord {
  id: number
  runDate: string
  distanceKm: number
  durationSeconds: number | null
}

export default function UploadPage() {
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

  useEffect(() => {
    loadRecords()
  }, [])

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setUploadError('GPX 파일만 업로드할 수 있습니다.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('파일 크기는 10MB 이하여야 합니다.')
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

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="font-semibold text-gray-800 mb-3">기록 업로드</h2>

      {/* 업로드 영역 */}
      <label
        htmlFor="gpx-file-input"
        className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          id="gpx-file-input"
          type="file"
          accept=".gpx"
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

      {/* 업로드 에러 */}
      {uploadError && (
        <p className="text-red-500 text-sm mt-2">{uploadError}</p>
      )}

      {/* 업로드 완료 요약 카드 */}
      {lastUploaded && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium">업로드 완료</p>
          <p className="text-green-600 text-sm mt-0.5">
            {lastUploaded.distanceKm.toFixed(2)} km
            {lastUploaded.durationSeconds != null && ` · ${Math.round(lastUploaded.durationSeconds / 60)}분`}
            {' · '}{lastUploaded.runDate}
          </p>
        </div>
      )}

      {/* 날짜별 기록 목록 */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">러닝 기록</h3>
        {loadingRecords ? (
          <p className="text-gray-400 text-sm">불러오는 중...</p>
        ) : recordsError ? (
          <p className="text-red-500 text-sm">{recordsError}</p>
        ) : records.length === 0 ? (
          <p className="text-gray-400 text-sm">아직 러닝 기록이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {records.map((r) => (
              <li key={r.id} className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-700">{r.runDate}</span>
                <span className="text-sm text-gray-500">
                  {r.distanceKm.toFixed(2)} km
                  {r.durationSeconds != null && ` · ${Math.round(r.durationSeconds / 60)}분`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
