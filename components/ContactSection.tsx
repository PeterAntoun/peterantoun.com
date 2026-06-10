export default function ContactSection() {
  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <div className="contact" id="contact">
          <div className="wrap">
            <div className="ct-grid">
              <div data-reveal>
                <h2>
                  Let&apos;s build
                  <br />
                  something that <em>scales.</em>
                </h2>
                <p className="lead">
                  Currently exploring new roles where data, AI and marketing meet. If that
                  sounds like your team, I&apos;d love to talk.
                </p>
                <div className="ct-actions">
                  <a href="mailto:antounpeter@gmail.com" className="btn">
                    antounpeter@gmail.com <span className="arr">{'↗︎'}</span>
                  </a>
                </div>
              </div>

              <div className="ct-side" data-reveal data-delay="1">
                <div className="headshot-wrap">
                  <div className="headshot-circle">headshot</div>
                </div>
                <div className="ct-links">
                  <a href="https://www.linkedin.com/in/peterantoun" target="_blank" rel="noreferrer noopener">
                    <span>LinkedIn</span><span className="ar">{'↗︎'}</span>
                  </a>
                  <a href="https://github.com/peterantoun" target="_blank" rel="noreferrer noopener">
                    <span>GitHub</span><span className="ar">{'↗︎'}</span>
                  </a>
                  <a href="#">
                    <span>Twitter / X</span><span className="ar">{'↗︎'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
