import Link from "next/link";
import BirdsClient from "./birds-client";

export default function BirdsPage() {
  return (
    <main className="birds-page">
      <nav className="site-nav birds-nav" aria-label="Main navigation">
        <Link className="brand-mark" href="/" aria-label="Flock home">
          <span>FLOCK!</span>
          <span className="brand-dot" aria-hidden="true" />
        </Link>
        <Link className="back-link" href="/">
          ← Back to the nest
        </Link>
      </nav>

      <header className="birds-header">
        <span className="section-number">THE COMPLETE AVIARY / IOC 15.2</span>
        <h1>
          CHOOSE YOUR
          <br />
          <i>FAVORITE.</i>
        </h1>
        <p>
          All 11,064 living bird species. Search by name, narrow by order, and
          keep wandering.
        </p>
      </header>

      <BirdsClient />

      <footer>
        <span>FLOCK! © 2026</span>
        <p>Created by Nagraj Tadingi</p>
        <Link href="/">Home ↖</Link>
      </footer>
    </main>
  );
}
