// components/SkeletonPost.jsx
export default function SkeletonPost() {
  return (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 p-4 rounded-lg space-y-3">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
      </div>
    </div>
  );
}
