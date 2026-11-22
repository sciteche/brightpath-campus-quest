import { ArrowDown, MoveUpRight } from "lucide-react";

import { RESULTS, SECTION_TITLES, type CampusSectionId } from "./content";
import { SectionContent } from "./SectionContent";

const CLASSIC_SECTIONS: CampusSectionId[] = ["courses", "results", "faculty", "fees", "demo"];

export function ClassicPage() {
  return (
    <div className="classic-page">
      <nav className="classic-jumpbar" aria-label="Page sections">
        {CLASSIC_SECTIONS.map((section) => (
          <a key={section} href={`#classic-${section}`}>{section === "demo" ? "Book a demo" : SECTION_TITLES[section]}</a>
        ))}
      </nav>

      <section className="classic-welcome" aria-labelledby="welcome-heading">
        <div className="welcome-copy">
          <p className="eyebrow">A FRIENDLY COACHING CENTRE IN SECTOR 62, NOIDA</p>
          <h2 id="welcome-heading">Learning that makes the next step feel possible.</h2>
          <p>Focused classes for students in Classes 9–12, with clear teaching and room to ask questions.</p>
          <a className="button button-primary" href="#classic-demo">Book a free demo <MoveUpRight size={16} aria-hidden="true" /></a>
        </div>
        <a className="scroll-cue" href="#classic-courses" aria-label="Scroll to courses">
          <ArrowDown size={17} aria-hidden="true" />
        </a>
      </section>

      <section className="classic-section course-section" id="classic-courses" aria-labelledby="courses-heading">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">A CLEAR PLAN FOR EVERY CLASS</p>
            <h2 id="courses-heading">Courses</h2>
          </div>
          <p>Monthly fees, with the first demo class free.</p>
        </div>
        <SectionContent section="courses" />
      </section>

      <section className="classic-results-band" id="classic-results" aria-labelledby="results-heading">
        <div className="results-band-inner">
          <div className="results-heading">
            <p className="eyebrow">STEADY PROGRESS, TOGETHER</p>
            <h2 id="results-heading">Good habits add up.</h2>
            <p>Thoughtful teaching, small batches and consistent practice support every learner.</p>
          </div>
          <div className="results-grid classic-results-grid">
            {RESULTS.map((result) => (
              <div className="result-stat" key={result.label}>
                <strong>{result.value}</strong>
                <span>{result.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="classic-section faculty-section" id="classic-faculty" aria-labelledby="faculty-heading">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">PATIENT TEACHERS, PERSONAL ATTENTION</p>
            <h2 id="faculty-heading">Faculty</h2>
          </div>
          <p>Teachers who make time for the questions that matter.</p>
        </div>
        <SectionContent section="faculty" />
      </section>

      <section className="classic-fees-band" id="classic-fees" aria-labelledby="fees-heading">
        <div className="fees-band-inner">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">NO SURPRISES</p>
              <h2 id="fees-heading">Fees</h2>
            </div>
            <p>Simple monthly pricing. Your first demo class is free.</p>
          </div>
          <SectionContent section="fees" />
        </div>
      </section>

      <section className="classic-demo-section" id="classic-demo" aria-labelledby="demo-heading">
        <div className="demo-intro">
          <p className="eyebrow">COME SEE IF IT FEELS RIGHT</p>
          <h2 id="demo-heading">Book a free demo class</h2>
          <p>Tell us a little about your student and we’ll help find a suitable time.</p>
        </div>
        <div className="classic-demo-form">
          <SectionContent section="demo" />
        </div>
      </section>

      <footer className="site-footer">
        <span className="footer-brand">BrightPath Classes</span>
        <span>Sector 62, Noida</span>
        <span>Demo website made for a tutorial.</span>
      </footer>
    </div>
  );
}