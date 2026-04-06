import MapPage from './pages/MapPage'
import UploadPage from './pages/UploadPage'
import GoalPage from './pages/GoalPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-[1000]">
        <h1 className="text-lg font-bold text-gray-900">🏃 러닝 대시보드</h1>
      </header>
      <main className="p-4 max-w-5xl mx-auto space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        <div className="lg:col-span-2">
          <MapPage />
        </div>
        <UploadPage />
        <GoalPage />
      </main>
    </div>
  )
}

export default App
