export default function Education() {
  return (
    <section className="section edu" id="education" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="edu-head" data-reveal>
          <span className="mono">Education — Double Diplôme</span>
          <span className="edu-line" />
        </div>

        <div className="edu-flow" data-reveal data-delay="1">
          <div className="edu-top">
            <div className="edu-card">
              <h3>
                Audencia
                <br />
                Business School
              </h3>
              <p className="edu-focus">Management &amp; Strategy</p>
              <p className="edu-loc mono">Nantes, France</p>
            </div>
            <div className="edu-card">
              <h3>
                École Centrale
                <br />
                de Nantes
              </h3>
              <p className="edu-focus">Data &amp; AI Engineering</p>
              <p className="edu-loc mono">Nantes, France</p>
            </div>
          </div>

          <div className="edu-wires" aria-hidden="true">
            <span className="wire v-left" />
            <span className="wire v-right" />
            <span className="wire rail" />
            <span className="wire v-down" />
            <span className="edu-node" />
            <span className="flow-dot dot-l" />
            <span className="flow-dot dot-r" />
            <span className="flow-dot dot-down" />
          </div>

          <div className="edu-bottom">
            <div className="edu-card edu-card--main">
              <h3>
                <span className="cap">🎓</span> Double Diplôme — BBA
              </h3>
              <p className="edu-focus">Data, AI &amp; Management</p>
              <p className="edu-loc mono">SEPT. 2021 — 2026 · NANTES, FRANCE</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
