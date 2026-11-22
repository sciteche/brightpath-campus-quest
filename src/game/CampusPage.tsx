import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { BookOpen, Gamepad2, MessageCircle, MoveUpRight, School, X } from "lucide-react";
import { Suspense, lazy, useState } from "react";

import { Button } from "@/components/ui/button";

import { GENERAL_WHATSAPP_HREF } from "./booking";
import { ClassicPage } from "./ClassicPage";
import { CAMPUS_BUILDINGS, SECTION_TITLES, type CampusSectionId } from "./content";
import { SectionContent } from "./SectionContent";

// Loaded on demand so three.js and react-three-fiber stay out of the initial bundle.
const CampusExperience = lazy(() =>
  import("./CampusExperience").then((module) => ({ default: module.CampusExperience })),
);

function isWebGLAvailable() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function CampusLoading() {
  return (
    <section className="campus-stage" aria-label="BrightPath Classes campus">
      <div className="campus-loading" role="status" aria-live="polite">
        <div className="loading-card">
          <p className="eyebrow">BRIGHTPATH CLASSES</p>
          <span>Preparing your campus…</span>
          <div
            className="loading-track"
            role="progressbar"
            aria-label="Campus loading progress"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CampusPage() {
  // When WebGL is unavailable (old devices, disabled drivers), open Classic view
  // automatically instead of letting the 3D canvas crash.
  const [webglAvailable] = useState(isWebGLAvailable);
  const [isClassic, setIsClassic] = useState(!webglAvailable);
  const [started, setStarted] = useState(false);
  const [activeSection, setActiveSection] = useState<CampusSectionId | null>(null);

  function bookDemo() {
    if (isClassic) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document
        .getElementById("classic-demo")
        ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    } else {
      setActiveSection("demo");
    }
  }

  function openSection(id: string) {
    const building = CAMPUS_BUILDINGS.find((item) => item.id === id);
    if (building) setActiveSection(building.id);
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <Link className="brand-lockup" to="/" aria-label="BrightPath Classes home">
          <span className="brand-mark">
            <School size={19} strokeWidth={2.3} aria-hidden="true" />
          </span>
          <span className="brand-wordmark">
            <strong>BrightPath</strong>
            <span>CLASSES · SECTOR 62</span>
          </span>
        </Link>
        <div className="topbar-actions">
          {webglAvailable ? (
            <Button
              className="button button-view"
              type="button"
              variant="outline"
              aria-pressed={isClassic}
              onClick={() => setIsClassic((current) => !current)}
            >
              {isClassic ? (
                <Gamepad2 size={17} aria-hidden="true" />
              ) : (
                <BookOpen size={17} aria-hidden="true" />
              )}
              <span>{isClassic ? "Explore campus" : "Classic view"}</span>
            </Button>
          ) : null}
          <Button className="button button-primary header-cta" type="button" onClick={bookDemo}>
            Book a free demo <MoveUpRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </header>

      <main>
        {webglAvailable ? (
          <Suspense fallback={<CampusLoading />}>
            <CampusExperience
              started={started}
              isClassic={isClassic}
              activeSection={activeSection}
              onStart={() => setStarted(true)}
              onOpenSection={openSection}
            />
          </Suspense>
        ) : (
          <section className="campus-stage campus-stage-classic" aria-label="BrightPath Classes">
            <div className="campus-intro campus-intro-classic">
              <p className="eyebrow">SECTOR 62 · NOIDA</p>
              <h1>BrightPath Classes</h1>
              <p>Small batches. Clear concepts. Brighter futures.</p>
              <a className="intro-link" href="#classic-courses">
                Explore classes <MoveUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </section>
        )}
        {isClassic ? (
          <ClassicPage />
        ) : (
          <footer className="site-footer game-footer">
            <span className="footer-brand">BrightPath Classes</span>
            <span>Sector 62, Noida</span>
            <span>Demo website made for a tutorial.</span>
          </footer>
        )}
      </main>

      <a
        className="whatsapp-float"
        href={GENERAL_WHATSAPP_HREF}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with BrightPath Classes on WhatsApp"
      >
        <MessageCircle className="whatsapp-icon" size={18} aria-hidden="true" />
        <span>WhatsApp</span>
      </a>

      <Dialog.Root
        open={activeSection !== null}
        onOpenChange={(open) => {
          if (!open) setActiveSection(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          {activeSection ? (
            <Dialog.Content className="section-dialog">
              <div className="dialog-heading">
                <div>
                  <p className="eyebrow">BRIGHTPATH CLASSES</p>
                  <Dialog.Title className="dialog-title">
                    {SECTION_TITLES[activeSection]}
                  </Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <Button
                    className="icon-button"
                    variant="outline"
                    size="icon"
                    type="button"
                    aria-label="Close section"
                  >
                    <X size={19} aria-hidden="true" />
                  </Button>
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">
                Campus information for {SECTION_TITLES[activeSection]}.
              </Dialog.Description>
              <SectionContent section={activeSection} />
            </Dialog.Content>
          ) : null}
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
