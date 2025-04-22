export default function ModulesLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
      </div>

      <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
            <div className="h-16 w-full bg-gray-200 rounded animate-pulse mt-4"></div>
            <div className="flex justify-between mt-4">
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
