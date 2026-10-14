
import { useApplications } from "../hooks/useApplications";
import Sidebar from "../components/Sidebar";
import {
  BriefcaseBusiness,
  CalendarCheck,
  Award,
  XCircle,
  TrendingUp,
  Target,
} from "lucide-react";
import "../style/dashboard.scss";
import "./statistics.scss";

const Statistics = () => {
  const { applications, stats, loading, actionError } = useApplications();

  const total = Number(stats?.totalApplications) || 0;
  const interviews = Number(stats?.interviews) || 0;
  const offers = Number(stats?.offers) || 0;
  const rejections = Number(stats?.rejections) || 0;

  const applied = applications.filter(
    (application) => application.status === "Applied"
  ).length;

  const responseRate =
    total > 0 ? Math.round(((interviews + offers + rejections) / total) * 100) : 0;

  const offerRate =
    total > 0 ? Math.round((offers / total) * 100) : 0;

  const metrics = [
    {
      label: "Total Applications",
      value: total,
      icon: BriefcaseBusiness,
      color: "total",
    },
    {
      label: "Interviews",
      value: interviews,
      icon: CalendarCheck,
      color: "interview",
    },
    {
      label: "Offers",
      value: offers,
      icon: Award,
      color: "offer",
    },
    {
      label: "Rejections",
      value: rejections,
      icon: XCircle,
      color: "rejected",
    },
  ];

  const statuses = [
    { label: "Applied", count: applied, color: "#7c3aed" },
    { label: "Interview", count: interviews, color: "#0284c7" },
    { label: "Offer", count: offers, color: "#059669" },
    { label: "Rejected", count: rejections, color: "#dc2626" },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-viewport statistics-page">
        <header className="statistics-header">
          <div>
            <p className="statistics-eyebrow">YOUR JOB SEARCH</p>
            <h1>Statistics</h1>
            <p className="statistics-subtitle">
              Understand your application progress and results.
            </p>
          </div>
        </header>

        <div className="statistics-content">
          {actionError && (
            <div className="error-banner" role="alert">
              {actionError}
            </div>
          )}

          {loading ? (
            <p className="statistics-message">Loading your statistics...</p>
          ) : (
            <>
              <section className="statistics-metrics" aria-label="Application totals">
                {metrics.map(({ label, value, icon: Icon, color }) => (
                  <article className="statistics-card" key={label}>
                    <div>
                      <p className="statistics-card-label">{label}</p>
                      <p className="statistics-card-value">{value}</p>
                    </div>
                    <div className={`statistics-icon ${color}`}>
                      <Icon size={22} />
                    </div>
                  </article>
                ))}
              </section>

              <div className="statistics-panels">
                <section className="statistics-panel">
                  <div className="statistics-panel-heading">
                    <div>
                      <h2>Application Breakdown</h2>
                      <p>Applications by current status</p>
                    </div>
                    <BriefcaseBusiness size={20} />
                  </div>

                  {total === 0 ? (
                    <p className="statistics-message">
                      No applications yet. Add a job to start tracking your progress.
                    </p>
                  ) : (
                    <div className="status-breakdown">
                      {statuses.map((status) => {
                        const percentage =
                          total > 0 ? (status.count / total) * 100 : 0;

                        return (
                          <div className="status-row" key={status.label}>
                            <div className="status-row-heading">
                              <span>
                                <span
                                  className="status-dot"
                                  style={{ backgroundColor: status.color }}
                                />
                                {status.label}
                              </span>
                              <strong>
                                {status.count}
                                <small> ({Math.round(percentage)}%)</small>
                              </strong>
                            </div>

                            <div className="status-track">
                              <div
                                className="status-fill"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: status.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="statistics-panel">
                  <div className="statistics-panel-heading">
                    <div>
                      <h2>Progress Insights</h2>
                      <p>Based on your tracked applications</p>
                    </div>
                    <TrendingUp size={20} />
                  </div>

                  <div className="insight-item">
                    <div className="insight-icon">
                      <Target size={19} />
                    </div>
                    <div>
                      <p>Response Rate</p>
                      <strong>{responseRate}%</strong>
                      <small>
                        Applications marked Interview, Offer, or Rejected
                      </small>
                    </div>
                  </div>

                  <div className="insight-item">
                    <div className="insight-icon">
                      <Award size={19} />
                    </div>
                    <div>
                      <p>Offer Rate</p>
                      <strong>{offerRate}%</strong>
                      <small>Offers as a percentage of all applications</small>
                    </div>
                  </div>

                  <div className="insight-item">
                    <div className="insight-icon">
                      <BriefcaseBusiness size={19} />
                    </div>
                    <div>
                      <p>Awaiting Response</p>
                      <strong>{applied}</strong>
                      <small>Applications currently marked Applied</small>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Statistics;
