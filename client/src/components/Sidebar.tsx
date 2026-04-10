export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 text-slate-100 p-5 hidden md:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-brand grid place-items-center font-bold">PP</div>
        <div>
          <p className="font-semibold">PromoPilot</p>
          <p className="text-xs text-slate-400">Mercado Livre SaaS</p>
        </div>
      </div>
      <ul className="space-y-2 text-sm text-slate-300">
        <li className="bg-slate-800 rounded-lg px-3 py-2">Dashboard</li>
        <li className="px-3 py-2">Resolver Link</li>
      </ul>
    </aside>
  );
}
