export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
    </div>
  );
}
