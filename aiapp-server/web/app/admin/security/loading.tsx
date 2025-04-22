import { Skeleton } from "@/components/ui/skeleton"

export default function SecurityLoading() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <Skeleton className="h-12 w-full mb-6" />

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
