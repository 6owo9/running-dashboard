const BASE_URL = '/api'

// 현재 목표 및 달성률 조회
export async function getCurrentGoal() {
  const res = await fetch(`${BASE_URL}/goals/current`)
  if (!res.ok) throw new Error('목표 정보를 불러오지 못했습니다.')
  return res.json()
}

// 목표 설정
export async function saveGoal(distanceKm: number) {
  const res = await fetch(`${BASE_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ distanceKm }),
  })
  if (!res.ok) throw new Error('목표 저장에 실패했습니다.')
  return res.json()
}
