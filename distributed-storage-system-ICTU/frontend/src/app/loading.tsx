export default function Loading() {
  return (
    <div className="h-screen bg-[#020202] flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Synchronisation...</span>
    </div>
  );
}