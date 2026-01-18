"use client";

import AboutFind from "../_components/AboutFind";
import AboutHelp from "../_components/AboutHelp";
import AboutHero from "../_components/AboutHero";
import AboutMake from "../_components/AboutMake";
import Footer from "../_components/Footer";

export default function AboutPage() {
  return (
    <main className="pt-10">
      <AboutHero />
      <AboutFind />
      <AboutMake />
      <AboutHelp />
    </main>
  );
}
