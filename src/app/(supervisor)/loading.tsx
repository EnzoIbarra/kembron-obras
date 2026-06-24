export default function SupervisorLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-7 w-40 animate-pulse rounded-lg bg-gray-200" />
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="h-11 animate-pulse border-b border-gray-100 bg-gray-50" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0">
            <div className="h-3 flex-1 animate-pulse rounded bg-gray-100" />
            <div className="h-2.5 w-16 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
