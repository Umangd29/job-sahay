
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChartNoAxesCombined,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Target,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../../auth/hooks/useAuth";
import "./HomePage.scss";

const features = [
  {
    icon: ClipboardList,
    title: "Track every application",
    description:
      "Keep company names, job titles, application dates, notes, and statuses organized in one place.",
  },
  {
    icon: LayoutDashboard,
    title: "Visual application board",
    description:
      "See your progress at a glance and organize opportunities by their current hiring stage.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Understand your progress",
    description:
      "Review your applications, interviews, offers, and rejections through a clear statistics dashboard.",
  },
  {
    icon: Clock3,
    title: "Stay organized",
    description:
      "Spend less time managing scattered information and more time preparing for your next opportunity.",
  },
];

const steps = [
  {
    number: "01",
    title: "Add an opportunity",
    description:
      "Save a job application with the company, role, date, and useful notes.",
  },
  {
    number: "02",
    title: "Track your progress",
    description:
      "Update each application's status as you move through the hiring process.",
  },
  {
    number: "03",
    title: "Move forward",
    description:
      "Use your organized application history to understand your progress and plan your next step.",
  },
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Avoid briefly showing the public homepage during redirect.
  if (user) {
    return null;
  }

  return (
    <div className="js-home">
      <header className="js-header">
        <div className="js-container js-header-inner">
          <Link
            to="/"
            className="js-brand"
            aria-label="Job Sahay home"
            onClick={() => setMenuOpen(false)}
          >
            <span className="js-brand-mark">
            <img
              src="/Job%20Sahay%20Career%20Growth%20Logo.png"
              alt="Job Sahay Logo"
              style={{
                width: "60px",
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "10px auto 20px",
              }}
            />
            </span>
            <span className="js-brand-name">
              Job <span>Sahay</span>
            </span>
          </Link>

          <button
            type="button"
            className="js-menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className={`js-nav ${menuOpen ? "is-open" : ""}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>

            <div className="js-nav-actions">
              <Link
                to="/login"
                className="js-login-link"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="js-button js-button-primary js-nav-cta"
                onClick={() => setMenuOpen(false)}
              >
                Get started <ArrowRight size={16} />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="js-hero">
          <div className="js-container js-hero-grid">
            <div className="js-hero-copy">
              <div className="js-eyebrow">
                <span className="js-eyebrow-dot" />
                YOUR CAREER, MORE ORGANIZED
              </div>

              <h1>
                Your next opportunity
                <br />
                deserves <span>a better plan.</span>
              </h1>

              <p className="js-hero-description">
                Job hunting can get overwhelming. Keep every application,
                interview, and opportunity organized in one simple workspace
                with Job Sahay.
              </p>

              <div className="js-hero-actions">
                <Link
                  to="/register"
                  className="js-button js-button-primary"
                >
                  Start tracking for free <ArrowRight size={17} />
                </Link>

                <a href="#features" className="js-secondary-link">
                  Explore features <ArrowRight size={16} />
                </a>
              </div>

              <div className="js-hero-note">
                <ShieldCheck size={17} />
                <span>A clearer way to manage your job search.</span>
              </div>
            </div>

            <div className="js-hero-visual">
              <div className="js-visual-heading">
                <div>
                  <span className="js-visual-overline">YOUR JOB SEARCH</span>
                  <h3>Progress at a glance</h3>
                </div>
                <span
                  className="js-live-dot"
                  title="Illustrative preview"
                />
              </div>

              <div className="js-mini-stats">
                <div className="js-mini-stat">
                  <span>Total applications</span>
                  <strong>12</strong>
                  <div className="js-mini-icon js-icon-purple">
                      <img
                      src="/Job%20Sahay%20Career%20Growth%20Logo.png"
                      alt="Job Sahay Logo"
                      style={{
                        width: "60px",
                        height: "auto",
                        objectFit: "contain",
                        display: "block",
                        margin: "10px auto 20px",
                      }}
                    />
                  </div>
                </div>

                <div className="js-mini-stat">
                  <span>Interviews</span>
                  <strong>04</strong>
                  <div className="js-mini-icon js-icon-blue">
                    <Target size={17} />
                  </div>
                </div>

                <div className="js-mini-stat">
                  <span>Offers</span>
                  <strong>02</strong>
                  <div className="js-mini-icon js-icon-green">
                    <CheckCircle2 size={17} />
                  </div>
                </div>
              </div>

              <div className="js-board-preview">
                <div className="js-board-title">
                  <div>
                    <h4>Application pipeline</h4>
                    <p>A sample view of your job search</p>
                  </div>
                  <LayoutDashboard size={19} />
                </div>

                <div className="js-pipeline">
                  <div className="js-pipeline-column">
                    <div className="js-pipeline-label">
                      <span className="js-status-dot dot-applied" />
                      Applied <span>2</span>
                    </div>

                    <div className="js-job-mini">
                      <span className="js-company-square company-one">T</span>
                      <div>
                        <strong>Frontend Developer</strong>
                        <small>Tech company</small>
                      </div>
                    </div>

                    <div className="js-job-mini">
                      <span className="js-company-square company-two">W</span>
                      <div>
                        <strong>Web Developer</strong>
                        <small>Digital studio</small>
                      </div>
                    </div>
                  </div>

                  <div className="js-pipeline-column">
                    <div className="js-pipeline-label">
                      <span className="js-status-dot dot-interview" />
                      Interview <span>1</span>
                    </div>

                    <div className="js-job-mini">
                      <span className="js-company-square company-three">A</span>
                      <div>
                        <strong>Software Engineer</strong>
                        <small>Product team</small>
                      </div>
                    </div>
                  </div>

                  <div className="js-pipeline-column">
                    <div className="js-pipeline-label">
                      <span className="js-status-dot dot-offer" />
                      Offer <span>1</span>
                    </div>

                    <div className="js-offer-preview">
                      <CheckCircle2 size={18} />
                      <span>Moving forward</span>
                    </div>
                  </div>
                </div>

                <p className="js-preview-disclaimer">
                  Illustrative data — not your account data.
                </p>
              </div>

              <div className="js-floating-note">
                <span className="js-floating-icon">
                  <TrendingUp size={19} />
                </span>
                <div>
                  <strong>Every step counts.</strong>
                  <span>Keep moving forward.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="js-trust-strip" aria-label="Product benefits">
          <div className="js-container js-trust-inner">
            <span>ONE WORKSPACE</span>
            <span className="js-trust-separator" />
            <span>FOUR APPLICATION STAGES</span>
            <span className="js-trust-separator" />
            <span>A CLEARER JOB SEARCH</span>
          </div>
        </section>

        <section className="js-section js-features" id="features">
          <div className="js-container">
            <div className="js-section-heading">
              <span className="js-section-kicker">BUILT FOR YOUR JOURNEY</span>
              <h2>
                Everything in its place.
                <br />
                <span>Progress within reach.</span>
              </h2>
              <p>
                A simpler way to organize your job search, follow up on
                opportunities, and see where you stand.
              </p>
            </div>

            <div className="js-feature-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <article className="js-feature-card" key={feature.title}>
                    <div
                      className={`js-feature-icon js-feature-icon-${index + 1}`}
                    >
                      <Icon size={22} strokeWidth={1.9} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <span className="js-feature-number">
                      0{index + 1}
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="js-section js-workflow"
          id="how-it-works"
        >
          <div className="js-container js-workflow-grid">
            <div className="js-workflow-intro">
              <span className="js-section-kicker">A SIMPLE PROCESS</span>
              <h2>
                Less juggling.
                <br />
                <span>More focus.</span>
              </h2>
              <p>
                You bring the ambition. Job Sahay helps you keep your
                application process organized from start to finish.
              </p>
              <Link to="/register" className="js-text-link">
                Organize your job search <ArrowRight size={17} />
              </Link>
            </div>

            <div className="js-steps">
              {steps.map((step) => (
                <article className="js-step" key={step.number}>
                  <div className="js-step-number">{step.number}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                  <ArrowRight className="js-step-arrow" size={19} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="js-section js-about" id="about">
          <div className="js-container">
            <div className="js-about-card">
              <div className="js-about-symbol">
                            <img
              src="/Job%20Sahay%20Career%20Growth%20Logo.png"
              alt="Job Sahay Logo"
              style={{
                width: "60px",
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "10px auto 20px",
              }}
            />
              </div>
              <span className="js-section-kicker">MEET JOB SAHAY</span>
              <h2>
                Your career journey.
                <br />
                <span>One step at a time.</span>
              </h2>
              <p>
                Finding the right opportunity takes time and effort. Job Sahay
                gives you a dedicated place to manage applications, track
                hiring stages, and stay focused on what comes next.
              </p>
              <Link
                to="/register"
                className="js-button js-button-primary"
              >
                Create your account <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section className="js-final-cta">
          <div className="js-container js-final-cta-inner">
            <div>
              <span className="js-section-kicker">
                YOUR NEXT CHAPTER STARTS HERE
              </span>
              <h2>Make your job search feel more manageable.</h2>
              <p>
                Bring your opportunities together and keep your next steps
                clear.
              </p>
            </div>
            <Link to="/register" className="js-button js-button-light">
              Get started <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="js-footer">
        <div className="js-container js-footer-inner">
          <Link to="/" className="js-brand">
            <span className="js-brand-mark">
                          <img
              src="/Job%20Sahay%20Career%20Growth%20Logo.png"
              alt="Job Sahay Logo"
              style={{
                width: "60px",
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "10px auto 20px",
              }}
            />
            </span>
            <span className="js-brand-name">
              Job <span>Sahay</span>
            </span>
          </Link>
          <p>Helping you keep your career journey organized.</p>
          <span className="js-copyright">
            © {new Date().getFullYear()} Job Sahay
          </span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
