export default function SupervisorLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      <p className="mt-4 text-sm text-gray-500">Cargando...</p>
    </div>
  );
}
