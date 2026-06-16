"use client";

/* eslint-disable @next/next/no-img-element -- these are CSS-driven art/logo
   elements (object-fit, grayscale, knockout filters, scroll-scrubbed canvas);
   next/image would change their layout/loading semantics and break fidelity. */

import { useEffect } from "react";
import type { CSSProperties } from "react";
import { initScrollChoreography } from "./scroll-choreography";
import { initSimulator } from "./simulator";
import { initValidationReveal } from "./validation-reveal";

/** Allow CSS custom properties in inline style objects. */
const cssVars = (vars: Record<string, string | number>): CSSProperties =>
  vars as unknown as CSSProperties;

export default function Landing() {
  useEffect(() => {
    // All window/document/canvas/WebGL access lives here — never during SSR.
    const cleanups = [
      initScrollChoreography(),
      initSimulator(),
      initValidationReveal(),
    ];
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      {/* ============ PERSISTENT TOOLBAR ============ */}
      <header
        className="toolbar"
        id="toolbar"
        style={{
          borderRadius: 15,
          padding: "0px 39px",
          borderWidth: 0,
          margin: 0,
          opacity: 1,
        }}
      >
        <a className="tb-brand" href="#top" aria-label="OLEXION home">
          <img src="/assets/brandname.png" alt="OLEXION" className="tb-word" />
        </a>
        <nav className="tb-nav">
          <a href="#engines">Engines</a>
          <a href="#validation">Validation</a>
          <a href="#simulator">Simulator</a>
          <a href="#vision">Vision</a>
        </nav>
        <a href="#simulator" className="tb-cta">
          Request formula
        </a>
      </header>

      <span id="top" />

      {/* ============ ACT 1 — HERO: glass intro + scroll-scrubbed video ============ */}
      <section className="act act--hero" id="hero-act" data-act="hero">
        <div className="hero-stage">
          <div className="hero-bg" id="heroBg">
            <video
              className="hero-decoder"
              id="heroVideo"
              muted
              playsInline
              preload="auto"
              data-src="/assets/hero.mp4"
            />
            <canvas className="bg-canvas" id="bgCanvas" />
          </div>
          <div className="hero-glass" id="heroGlass">
            <div className="hg-tint" />
            <div
              className="hg-cut"
              id="heroCut"
              style={{ opacity: 0.01, margin: 5 }}
            />
            <div className="hg-brand" id="heroBrand">
              <h1 className="hg-brand-name">OLEXION</h1>
              <p className="hg-brand-sub">
                Applied Bio-Based Formula · Chemistry in Motion
              </p>
            </div>
          </div>
          <div className="hero-vignette" />
          <div className="hero-dark" id="heroDark" />

          {/* scroll hint */}
          <div className="scroll-hint" id="scrollHint">
            <span>Scroll</span>
            <i />
          </div>

          {/* text reveal: formula blends into fuel (exploded-view moment) */}
          <div className="reveal reveal--formula" id="revealFormula">
            <p className="reveal-eyebrow">At the molecular level</p>
            <h2 className="reveal-title">
              It blends into
              <br />
              your fuel.
            </h2>
            <p className="reveal-body">
              AF&#8209;C1 disperses completely into the fuel and travels into the
              combustion chamber — extending engine longevity and notably lowering
              consumption.
            </p>
          </div>

          {/* text reveal: ignition (flame moment) */}
          <div className="reveal reveal--ignition" id="revealIgnition">
            <p className="reveal-eyebrow">Combustion</p>
            <h2 className="reveal-title">
              <span className="big-num">20%</span>
              <br />
              faster ignition.
            </h2>
            <p className="reveal-body">
              A cleaner, more complete burn — ignition begins sooner and releases
              more usable energy from every cycle.
            </p>
          </div>

          {/* text reveal: emissions (hero goes deep-blur + dark) */}
          <div className="reveal reveal--emissions" id="revealEmissions">
            <p className="reveal-eyebrow">Cleaner combustion, by design</p>
            <h2 className="reveal-title">
              Significantly fewer particulates.
              <br />
              Measurably less CO&#8322;.
            </h2>
          </div>
        </div>
      </section>

      {/* ============ ACT 2 — EMISSIONS block → engines self-draw ============ */}
      <section className="act act--emissions" id="emissions-act" data-act="emissions">
        <div className="em-stage">
          {/* black engines backdrop revealed beneath the rising block */}
          <div className="engines" id="engines">
            <div className="engines-head">
              <p className="eyebrow eyebrow--light">&nbsp;</p>
              <h2 className="engines-title">
                Built for the machines
                <br />
                that move the world.
              </h2>
            </div>
            <div className="engine-stage">
              <figure className="engine" data-engine="0">
                <div className="engine-art">
                  <img src="/assets/engine-1.png" alt="Automotive engine schematic" />
                </div>
                <figcaption>
                  <h3>Automotive &amp; Fleets</h3>
                  <p>
                    Heavy-duty diesel fleets, mining haulers and stationary
                    generators.
                  </p>
                </figcaption>
              </figure>
              <figure className="engine" data-engine="1">
                <div className="engine-art">
                  <img src="/assets/engine-2.png" alt="Marine engine schematic" />
                </div>
                <figcaption>
                  <h3>Marine &amp; Power</h3>
                  <p>
                    Two-stroke marine engines, industrial boilers and power
                    generation.
                  </p>
                </figcaption>
              </figure>
              <figure className="engine" data-engine="2">
                <div className="engine-art">
                  <img src="/assets/engine-3.png" alt="Aerospace engine schematic" />
                </div>
                <figcaption>
                  <h3>Aerospace &amp; Propulsion</h3>
                  <p>
                    Experimental propulsion and high-energy combustion research.
                  </p>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ACT 3 — VALIDATION ============ */}
      <section className="section section--validation" id="validation">
        <div className="wrap val-stage">
          <div className="val-head">
            <h2 className="section-title">
              Stress-tested by the people
              <br />
              who measure everything.
            </h2>
            <p className="section-lead">
              AF&#8209;C1 has been independently tested across academic, industrial
              and energy partners — delivering measurable, repeatable improvements
              in real operating conditions.
            </p>
          </div>
          <ul className="val-grid" id="valGrid">
            <li className="val-card" style={cssVars({ "--i": 0 })}>
              <img src="/assets/logos/lund.png" alt="Lund University" />
            </li>
            <li className="val-card" style={cssVars({ "--i": 1 })}>
              <img src="/assets/logos/boliden_c.png" alt="Boliden" />
            </li>
            <li className="val-card" style={cssVars({ "--i": 2 })}>
              <img src="/assets/logos/shell.svg" alt="Shell" />
            </li>
            <li className="val-card" style={cssVars({ "--i": 3 })}>
              <img
                className="val-img--lg"
                src="/assets/logos/dutco_c.png"
                alt="Dutco Energy"
              />
            </li>
            <li className="val-card" style={cssVars({ "--i": 4 })}>
              <img
                className="val-img--circle"
                src="/assets/logos/saab.png"
                alt="SAAB"
              />
            </li>
          </ul>
        </div>
      </section>

      {/* ============ ACT 4 — SIMULATOR ============ */}
      <section className="section section--sim" id="simulator">
        <div className="wrap sim-wrap">
          <div className="sim-intro">
            <p className="eyebrow" aria-hidden="true">
              &nbsp;
            </p>
            <h2 className="section-title">
              Tuned to your engine.
              <br />
              Never off the shelf.
            </h2>
            <p className="section-lead">
              AF&#8209;C1 is formulated per engine architecture and fuel type. Enter
              your setup and model the projected outcome before you order.
            </p>
          </div>

          <div className="sim-panel">
            <form className="sim-form" id="simForm">
              <div className="field">
                <label htmlFor="f-industry">Application</label>
                <select id="f-industry" defaultValue="fleet">
                  <option value="fleet">Automotive &amp; Fleets</option>
                  <option value="marine">Marine &amp; Power</option>
                  <option value="mining">Mining</option>
                  <option value="boiler">Boilers &amp; Generation</option>
                  <option value="aero">Aerospace &amp; Propulsion</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-fuel">Fuel type</label>
                <select id="f-fuel" defaultValue="diesel">
                  <option value="diesel">Diesel</option>
                  <option value="hfo">Heavy fuel oil (HFO)</option>
                  <option value="mgo">Marine gas oil (MGO)</option>
                  <option value="biodiesel">Biodiesel blend</option>
                  <option value="kerosene">Kerosene / Jet</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-volume">
                  Annual fuel use <span className="unit">(m³ / year)</span>
                </label>
                <input
                  type="number"
                  id="f-volume"
                  defaultValue="4200"
                  min="1"
                  step="50"
                />
              </div>
              <div className="field">
                <label htmlFor="f-price">
                  Fuel price <span className="unit">(€ / litre)</span>
                </label>
                <input
                  type="number"
                  id="f-price"
                  defaultValue="1.05"
                  min="0"
                  step="0.01"
                />
              </div>
              <button type="submit" className="sim-run" id="simRun">
                Run simulation
              </button>
            </form>

            <div className="sim-results" id="simResults">
              <div className="sim-stats">
                <div className="stat" data-stat>
                  <div className="stat-ring" style={cssVars({ "--pv": 15 })}>
                    <svg className="stat-svg" viewBox="0 0 100 100" aria-hidden="true">
                      <circle className="ring-track" cx="50" cy="50" r="43" />
                      <circle
                        className="ring-fill"
                        cx="50"
                        cy="50"
                        r="43"
                        pathLength={100}
                      />
                    </svg>
                    <span className="stat-val" data-target="15" data-suffix="%">
                      0%
                    </span>
                  </div>
                  <span className="stat-label">Less fuel consumption</span>
                </div>
                <div className="stat" data-stat>
                  <div className="stat-ring" style={cssVars({ "--pv": 75 })}>
                    <svg className="stat-svg" viewBox="0 0 100 100" aria-hidden="true">
                      <circle className="ring-track" cx="50" cy="50" r="43" />
                      <circle
                        className="ring-fill"
                        cx="50"
                        cy="50"
                        r="43"
                        pathLength={100}
                      />
                    </svg>
                    <span className="stat-val" data-target="75" data-suffix="%">
                      0%
                    </span>
                  </div>
                  <span className="stat-label">Particulate reduction</span>
                </div>
                <div className="stat" data-stat>
                  <div className="stat-ring" style={cssVars({ "--pv": 79 })}>
                    <svg className="stat-svg" viewBox="0 0 100 100" aria-hidden="true">
                      <circle className="ring-track" cx="50" cy="50" r="43" />
                      <circle
                        className="ring-fill"
                        cx="50"
                        cy="50"
                        r="43"
                        pathLength={100}
                      />
                    </svg>
                    <span
                      className="stat-val"
                      data-target="15.8"
                      data-suffix="%"
                      data-decimals="1"
                    >
                      0%
                    </span>
                  </div>
                  <span className="stat-label">Fuel-efficiency improvement</span>
                </div>
                <div className="stat" data-stat>
                  <div className="stat-ring" style={cssVars({ "--pv": 55 })}>
                    <svg className="stat-svg" viewBox="0 0 100 100" aria-hidden="true">
                      <circle className="ring-track" cx="50" cy="50" r="43" />
                      <circle
                        className="ring-fill"
                        cx="50"
                        cy="50"
                        r="43"
                        pathLength={100}
                      />
                    </svg>
                    <span className="stat-val" data-target="11" data-suffix="%">
                      0%
                    </span>
                  </div>
                  <span className="stat-label">CO&#8322; reduction</span>
                </div>
              </div>
              <div className="sim-savings">
                <div className="saving">
                  <span className="saving-label">Projected fuel saved / year</span>
                  <span className="saving-val" id="savVol">
                    —
                  </span>
                </div>
                <div className="saving">
                  <span className="saving-label">Projected cost saved / year</span>
                  <span className="saving-val" id="savCost">
                    —
                  </span>
                </div>
                <p className="sim-note">
                  Indicative model. Your final formula is tuned to your exact engine
                  and fuel specification.
                </p>
                <a href="#" className="sim-order">
                  Request a tailored formula →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ACT 5 — VISION ============ */}
      <section className="act act--vision" id="vision" data-act="vision">
        <div className="vision-stage">
          <div className="vision-media">
            <img src="/assets/vision.jpeg" alt="OLEXION campus" id="visionImg" />
            <div className="vision-grade" />
          </div>
          <div className="vision-texts">
            <div className="vtext" data-v="0">
              <h2>
                A better world,
                <br />
                by formula.
              </h2>
            </div>
            <div className="vtext" data-v="1">
              <h2>
                100% biodegradable.
                <br />
                Non&#8209;toxic. By design.
              </h2>
            </div>
            <div className="vtext" data-v="2">
              <h2>
                Helping industry — and space —
                <br />
                burn cleaner.
              </h2>
            </div>
            <div className="vtext vtext--end" data-v="3">
              <img src="/assets/brandname.png" alt="OLEXION" className="vision-word" />
              <p>CHEMISTRY IN MOTION</p>
              <a href="mailto:hello@olexion.se" className="vision-cta">
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="wrap foot-grid">
          <div className="foot-brand">
            <img src="/assets/brandname.png" alt="OLEXION" className="foot-word" />
            <p>
              Applied bio-based fuel chemistry.
              <br />
              Engineered in Sweden.
            </p>
          </div>
          <div className="foot-col">
            <h4>Product</h4>
            <a href="#engines">AF-C1</a>
            <a href="#validation">Validation</a>
            <a href="#simulator">Simulator</a>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <a href="#vision">Vision</a>
            <a href="#top">About</a>
            <a href="#top">Careers</a>
          </div>
          <div className="foot-col">
            <h4>Contact</h4>
            <a href="mailto:hello@olexion.se">hello@olexion.se</a>
            <a href="#top">Stockholm, Sweden</a>
          </div>
        </div>
        <div className="wrap foot-base">
          <span>© 2026 OLEXION Applied Formula AB. All rights reserved.</span>
          <span className="foot-flag">Sustainable by Nature · Made in Sweden</span>
        </div>
      </footer>
    </>
  );
}
