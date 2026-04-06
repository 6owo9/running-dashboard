import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { getRunningRecords } from '../api/runningApi'

type Period = 'today' | 'week'

interface RunningRecord {
  id: number
  date: string
  distanceKm: number
  durationMin: number
  coordinates: number[][]
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [period, setPeriod] = useState<Period>('today')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [records, setRecords] = useState<RunningRecord[]>([])

  // 지도 초기화 (최초 1회)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    mapRef.current = L.map(mapContainerRef.current).setView([37.5665, 126.978], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // 기간 변경 시 기록 조회
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getRunningRecords(period)
        setRecords(res.data ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  // 기록 변경 시 폴리라인 갱신
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // 기존 폴리라인·마커 제거 (타일 레이어 유지)
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    const allLatLngs: L.LatLngTuple[] = []
    records.forEach((record) => {
      if (record.coordinates.length === 0) return
      const latlngs: L.LatLngTuple[] = record.coordinates.map((c) => [c[0], c[1]])
      L.polyline(latlngs, { color: '#3b82f6', weight: 4, opacity: 0.8 }).addTo(map)
      L.circleMarker(latlngs[0], {
        radius: 7,
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map)
      allLatLngs.push(...latlngs)
    })

    if (allLatLngs.length > 0) {
      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [20, 20] })
    }
  }, [records])

  return (
    <section className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">러닝 경로</h2>
        <div className="flex gap-1">
          {(['today', 'week'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === 'today' ? '오늘' : '일주일'}
            </button>
          ))}
        </div>
      </div>

      {/* 지도 컨테이너 */}
      <div className="relative h-[400px] bg-gray-100">
        <div ref={mapContainerRef} className="h-full w-full" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[999]">
            <span className="text-gray-500 text-sm">불러오는 중...</span>
          </div>
        )}
        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[999]">
            <span className="text-red-500 text-sm">{error}</span>
          </div>
        )}
        {!loading && !error && records.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
            <span className="text-gray-400 text-sm bg-white/90 px-4 py-2 rounded-full shadow">
              해당 기간에 러닝 기록이 없습니다.
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
