import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <div className={styles.pulseNode}></div>
          <span className={styles.brand}>better-next-sitemap</span>
        </div>
        <p className={styles.badge}>v1.0.0</p>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Next.js Sitemaps, <span className={styles.highlight}>Perfected</span>.
          </h1>
          <p className={styles.description}>
            A demonstration environment showcasing drop-in migration paths and 
            powerful dynamic generators for massive web applications.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Card 1: Basic Migration */}
          <Link href="/my_sitemap.xml" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>🚀</div>
              <h2>Basic Migration &rarr;</h2>
            </div>
            <p>
              Instantly convert a native Next.js <code>sitemap.ts</code> array into 
              cache-ready, standards-compliant XML via a single API route.
            </p>
            <div className={styles.endpoint}>/my_sitemap.xml</div>
          </Link>

          {/* Card 2: Migrated Complex Sitemap */}
          <Link href="/sitemaps/migrated.xml?type=migrated" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>🔄</div>
              <h2>Complex Migration &rarr;</h2>
            </div>
            <p>
              Demonstrates 1-to-1 migration of <code>generateSitemaps</code> for 
              handling large datasets out of the box.
            </p>
            <div className={styles.endpoint}>/sitemaps/migrated.xml</div>
          </Link>

          {/* Card 3: Advanced Generators */}
          <Link href="/sitemaps/sitemap_index.xml" className={`${styles.card} ${styles.featuredCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>⚡</div>
              <h2>Advanced Generators &rarr;</h2>
            </div>
            <p>
              Explore the advanced <code>generators</code> paradigm to handle automatic 
              index creation and virtually limitless sub-sitemaps seamlessly.
            </p>
            <div className={styles.endpoint}>/sitemaps/sitemap_index.xml</div>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Built with precision for Next.js App Router.</p>
        <div className={styles.footerLinks}>
          <a href="https://github.com/immi-org/better-next-sitemap" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://npmjs.com/package/better-next-sitemap" target="_blank" rel="noopener noreferrer">NPM</a>
        </div>
      </footer>
    </div>
  );
}

