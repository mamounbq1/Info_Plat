export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 mb-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 animate-pulse">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-1.5"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      ))}
    </div>
  );
}

export function CourseCardSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row animate-pulse">
        <div className="w-full sm:w-40 h-40 sm:h-auto bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex-1 p-4 sm:p-5">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-36 sm:h-40 bg-gray-300 dark:bg-gray-600"></div>
      <div className="p-3 sm:p-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
        <div className="flex gap-1.5">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
        <div className="mt-3 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
}

export function CoursesGridSkeleton({ count = 6, viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <CourseCardSkeleton key={i} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(count)].map((_, i) => (
        <CourseCardSkeleton key={i} viewMode="grid" />
      ))}
    </div>
  );
}
