export const SkeletonLoader = () => (
  <div className="bg-ey-lightGray p-10 rounded-2xl max-w-md w-full">
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-300 rounded w-3/4 mx-auto" />
      <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto" />
      <div className="space-y-2">
        <div className="h-12 bg-gray-300 rounded" />
        <div className="h-12 bg-gray-300 rounded" />
        <div className="h-10 bg-gray-300 rounded w-1/3 mx-auto" />
      </div>
    </div>
  </div>
);