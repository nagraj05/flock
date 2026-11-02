import Link from "next/link";

export default function BirdNotFound() {
  return (
    <main className="bird-not-found">
      <span>404 / EMPTY NEST</span>
      <h1>THAT BIRD<br />FLEW AWAY.</h1>
      <p>The species slug does not match a bird in this flock.</p>
      <Link className="brutal-button yellow" href="/birds">Browse all birds →</Link>
    </main>
  );
}
