export default function Topbar() {
  return (
    <header className="topbar">
      <div className="wrap">
        <a href="#top" className="brand">
          <span className="dot" />
        </a>
        <nav className="nav">
          <span className="links">
            <a href="#expertise">Expertise</a>
            <a href="#education">Education</a>
            <a href="#work">Work</a>
          </span>
          <a href="#contact" className="btn ghost btn-nav" style={{ padding: '9px 18px' }}>
            Get in touch
          </a>
          <a href="#contact" className="btn" style={{ marginLeft: '8px' }}>
            Get in touch <span className="arr">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
