import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, Gamepad2, MessageCircle, MoveUpRight, School, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { GENERAL_WHATSAPP_HREF } from "./booking";
import { CampusExperience } from "./CampusExperience";
import { ClassicPage } from "./ClassicPage";
import { CAMPUS_BUILDINGS, SECTION_TITLES, type CampusSectionId } from "./content";
import { SectionContent } from "./SectionContent";

export function CampusPage() {
  const [isClassic, setIsClassic] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeSection, setActiveSection] = useState<CampusSectionId | null>(null);

  function bookDemo() {
    if (isClassic) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("classic-demo")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
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
        <a className="brand-lockup" href="/" aria-label="BrightPath Classes home">
          <span className="brand-mark"><School size={19} strokeWidth={2.3} aria-hidden="true" /></span>
          <span className="brand-wordmark"><strong>BrightPath</strong><span>CLASSES · SECTOR 62</span></span>
        </a>
        <div className="topbar-actions">
          <Button
            className="button button-view"
            type="button"
            variant="outline"
            aria-pressed={isClassic}
            onClick={() => setIsClassic((current) => !current)}
          >
            {isClassic ? <Gamepad2 size={17} aria-hidden="true" /> : <BookOpen size={17} aria-hidden="true" />}
            <span>{isClassic ? "Explore campus" : "Classic view"}</span>
          </Button>
          <Button className="button button-primary header-cta" type="button" onClick={bookDemo}>
            Book a free demo <MoveUpRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </header>

      <main>
        <CampusExperience
          started={started}
          isClassic={isClassic}
          activeSection={activeSection}
          onStart={() => setStarted(true)}
          onOpenSection={openSection}
        />
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

      <a className="whatsapp-float" href={GENERAL_WHATSAPP_HREF} target="_blank" rel="noreferrer" aria-label="Chat with BrightPath Classes on WhatsApp">
        <MessageCircle className="whatsapp-icon" size={18} aria-hidden="true" />
        <span>WhatsApp</span>
      </a>

      <Dialog.Root open={activeSection !== null} onOpenChange={(open) => { if (!open) setActiveSection(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          {activeSection ? (
            <Dialog.Content className="section-dialog">
              <div className="dialog-heading">
                <div>
                  <p className="eyebrow">BRIGHTPATH CLASSES</p>
                  <Dialog.Title className="dialog-title">{SECTION_TITLES[activeSection]}</Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <Button className="icon-button" variant="outline" size="icon" type="button" aria-label="Close section">
                    <X size={19} aria-hidden="true" />
                  </Button>
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">Campus information for {SECTION_TITLES[activeSection]}.</Dialog.Description>
              <SectionContent section={activeSection} />
            </Dialog.Content>
          ) : null}
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}