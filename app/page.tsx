import Topbar from '@/components/Topbar';
import Hero from '@/components/Hero';
import Expertise from '@/components/Expertise';
import Projects from '@/components/Projects';
import Education from '@/components/Education';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import Animations from '@/components/Animations';

export default function Home() {
  return (
    <>
      <Topbar />
      <main id="top">
        <Hero />
        <Expertise />
        <Projects />
        <Education />
        <ContactSection />
      </main>
      <Footer />
      <ThemeToggle />
      <Animations />
    </>
  );
}
