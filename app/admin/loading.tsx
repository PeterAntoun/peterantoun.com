/* Shown instantly on any /admin route transition (Next.js wraps the page in a
   Suspense boundary with this fallback) so a sidebar click registers immediately
   while the server component fetches. Mirrors the common dashboard layout:
   page header, a row of stat cards, and a chart card. */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <header className="adm-page-head">
        <div style={{ flex: 1 }}>
          <div className="adm-skel adm-skel-line" style={{ width: 180, height: 28 }} />
          <div className="adm-skel adm-skel-line" style={{ width: 260, marginTop: 10 }} />
        </div>
      </header>

      <section className="adm-stat-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="adm-card">
            <div className="adm-skel adm-skel-line" style={{ width: '50%' }} />
            <div
              className="adm-skel adm-skel-line"
              style={{ width: '70%', height: 24, marginTop: 14 }}
            />
            <div
              className="adm-skel adm-skel-line"
              style={{ width: '60%', marginTop: 12 }}
            />
          </div>
        ))}
      </section>

      <section className="adm-section adm-card">
        <div className="adm-skel adm-skel-line" style={{ width: 200, marginBottom: 16 }} />
        <div className="adm-skel adm-skel-chart" />
      </section>
    </div>
  );
}
