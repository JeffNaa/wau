function AdminApp() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-4xl font-bold text-primary">Wau Dashboard</h1>
      <p className="text-muted">Admin panel placeholder</p>
      <div className="flex gap-2">
        <span className="px-3 py-1 rounded-md bg-primary text-white text-sm">React 19</span>
        <span className="px-3 py-1 rounded-md bg-secondary text-white text-sm">Tailwind v4</span>
      </div>
    </div>
  )
}

export default AdminApp
