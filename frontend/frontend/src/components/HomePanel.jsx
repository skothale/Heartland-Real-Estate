import {
  Building2,
  FileCheck,
  MapPin,
  Construction,
  Upload,
  Files,
  Sparkles,
} from 'lucide-react';

const IMG = {
  hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&w=1200&q=80',
  neighborhood:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=800&q=80',
  signing:
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&w=800&q=80',
  skyline:
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&h=500&q=80',
};

export default function HomePanel({ onGoToUploadDocument }) {
  return (
    <div className="home-panel">
      <section className="home-hero-split">
        <div className="home-hero-split__text">
          <p className="home-eyebrow">Heartland Real Estate</p>
          <h1 className="home-title">
            The paperwork side of property made clearer for your team
          </h1>
          <p className="home-lead">
            Every sale and lease generates PDFs: disclosures, amendments, HOA packets, title
            summaries, and broker correspondence. Heartland gives your brokerage a single place
            to <strong>upload</strong> those files, <strong>see what is on file</strong>, and track
            status as we add search and review tools.
          </p>
        </div>
        <div className="home-hero-split__visual">
          <img
            src={IMG.hero}
            alt="Modern residential architecture at dusk, representing Heartland properties"
            width={640}
            height={420}
            loading="eager"
            decoding="async"
            className="home-hero-split__img"
          />
          <p className="home-hero-split__caption">
            Photo: residential community — the kind of portfolio your documents support every day.
          </p>
        </div>
      </section>

      <section className="home-gallery" aria-label="Real estate in context">
        <figure className="home-gallery__item">
          <img
            src={IMG.neighborhood}
            alt="Suburban homes along a street"
            width={400}
            height={260}
            loading="lazy"
            decoding="async"
          />
          <figcaption>Listings &amp; leases live on streets and spreadsheets—but proof lives in PDFs.</figcaption>
        </figure>
        <figure className="home-gallery__item">
          <img
            src={IMG.signing}
            alt="Hands reviewing documents and keys on a desk"
            width={400}
            height={260}
            loading="lazy"
            decoding="async"
          />
          <figcaption>Closings depend on clean files: contracts, addenda, and lender packages.</figcaption>
        </figure>
        <figure className="home-gallery__item">
          <img
            src={IMG.skyline}
            alt="City skyline with office towers"
            width={400}
            height={260}
            loading="lazy"
            decoding="async"
          />
          <figcaption>Commercial teams juggle even more counterparties and version history.</figcaption>
        </figure>
      </section>

      <section className="home-about" aria-labelledby="home-about-heading">
        <h2 id="home-about-heading" className="home-section-title">
          Why real estate needs a document hub
        </h2>
        <div className="home-about__grid">
          <p>
            Brokers and transaction coordinators rarely lose deals because of missing email—they
            lose time hunting for the <em>right PDF revision</em> across inboxes, drives, and
            transaction software exports. Regulators and broker-owners alike care that disclosures
            and agency forms are complete and retrievable.
          </p>
          <p>
            Heartland starts with <strong>secure PDF storage</strong> tied to a simple record
            (title, file name, size, status). That foundation supports the next steps: portfolio
            views, client-specific folders, and assisted review of common contract clauses.
          </p>
        </div>
      </section>

      <section className="home-app" aria-labelledby="home-app-heading">
        <h2 id="home-app-heading" className="home-section-title">
          What this app does today
        </h2>
        <ul className="home-app__cards">
          <li className="home-app__card">
            <div className="home-app__card-icon" aria-hidden>
              <Upload size={22} strokeWidth={1.75} />
            </div>
            <h3>Upload Document</h3>
            <p>
              Add PDFs up to 10 MB with an optional title. You get a live progress bar while the
              file is sent to the server, then a confirmation with the saved document ID.
            </p>
          </li>
          <li className="home-app__card">
            <div className="home-app__card-icon" aria-hidden>
              <Files size={22} strokeWidth={1.75} />
            </div>
            <h3>Documents</h3>
            <p>
              Browse everything your team has uploaded: titles, file names, sizes, status, and
              timestamps—so you can audit what is on file before a closing or compliance check.
            </p>
          </li>
          <li className="home-app__card">
            <div className="home-app__card-icon home-app__card-icon--muted" aria-hidden>
              <Sparkles size={22} strokeWidth={1.75} />
            </div>
            <h3>Coming next</h3>
            <p>
              Search across text inside PDFs, deal rooms per property, and guided review for
              leases and purchase agreements—built on the same document core you use now.
            </p>
          </li>
        </ul>
      </section>

      <div className="home-wip">
        <div className="home-wip__icon" aria-hidden>
          <Construction size={22} strokeWidth={1.75} />
        </div>
        <div>
          <p className="home-wip__title">Work in progress</p>
          <p className="home-wip__text">
            Upload and document list are live. Search, workspaces, and automated review are in
            active development—try an upload to see the end-to-end flow today.
          </p>
        </div>
      </div>

      <ul className="home-points">
        <li>
          <span className="home-points__icon">
            <Building2 size={18} strokeWidth={1.75} />
          </span>
          <div>
            <strong>Built for brokerages</strong>
            <span>Aligns with how deals actually move—from first showing to file retention.</span>
          </div>
        </li>
        <li>
          <span className="home-points__icon">
            <FileCheck size={18} strokeWidth={1.75} />
          </span>
          <div>
            <strong>Audit-friendly</strong>
            <span>Each upload is stored with metadata you can reference in reviews and trainings.</span>
          </div>
        </li>
        <li>
          <span className="home-points__icon">
            <MapPin size={18} strokeWidth={1.75} />
          </span>
          <div>
            <strong>Heartland-first</strong>
            <span>Designed for Midwest markets, timelines, and the mix of residential and small commercial work.</span>
          </div>
        </li>
      </ul>

      <div className="home-actions">
        <button type="button" className="btn-primary" onClick={onGoToUploadDocument}>
          Upload a document
        </button>
        <p className="home-actions__hint">
          Opens the Upload Document tab with drag-and-drop and progress tracking.
        </p>
      </div>

      <p className="home-photo-credit">
        Photos via{' '}
        <a href="https://unsplash.com" target="_blank" rel="noreferrer noopener">
          Unsplash
        </a>{' '}
        (community, signing, skyline).
      </p>
    </div>
  );
}
