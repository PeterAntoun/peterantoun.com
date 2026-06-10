const WORK = [
  { num: '01', title: 'Cutting CAC by 38%', kind: 'Case study', cat: 'Growth · Attribution', year: '2025' },
  { num: '02', title: 'Predictive LTV in production', kind: 'Project', cat: 'AI · Forecasting', year: '2025' },
  { num: '03', title: 'The death of last-click', kind: 'Essay', cat: 'Writing · Measurement', year: '2024' },
  { num: '04', title: 'Lifecycle that compounds', kind: 'Case study', cat: 'Marketing · Retention', year: '2024' },
];

export default function Work() {
  return (
    <section className="section" id="work" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2>
            Selected work
            <br />
            &amp; writing
          </h2>
          <span className="mono idx">What&apos;s new ↓</span>
        </div>

        <div className="work-list">
          {WORK.map((item) => (
            <a key={item.num} className="work-row" href="#contact" data-reveal>
              <span className="fill" />
              <span className="w-num">{item.num}</span>
              <span className="w-title">
                {item.title}
                <span className="kind">{item.kind}</span>
              </span>
              <span className="w-cat">{item.cat}</span>
              <span className="w-year">{item.year}</span>
              <span className="w-go">{'↗︎'}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
