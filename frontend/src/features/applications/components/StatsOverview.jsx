import { useApplications } from "../hooks/useApplications";
import { Briefcase, CalendarCheck, Award, XCircle } from "lucide-react";

const StatsOverview = () => {
  const { stats } = useApplications();

  return (
    <section className="stats-grid" aria-label="Dashboard Statistics">
      {/* 1. Total Applications */}
      <div className="stat-card">
        <div className="stat-details">
          <span className="stat-label">Total Applications</span>
          <span className="stat-number">{stats.totalApplications || 0}</span>
        </div>
        <div className="stat-icon-wrapper icon-total">
          <Briefcase size={22} />
        </div>
      </div>

      {/* 2. Interviews */}
      <div className="stat-card">
        <div className="stat-details">
          <span className="stat-label">Interviews</span>
          <span className="stat-number">{stats.interviews || 0}</span>
        </div>
        <div className="stat-icon-wrapper icon-interview">
          <CalendarCheck size={22} />
        </div>
      </div>

      {/* 3. Offers */}
      <div className="stat-card">
        <div className="stat-details">
          <span className="stat-label">Offers</span>
          <span className="stat-number">{stats.offers || 0}</span>
        </div>
        <div className="stat-icon-wrapper icon-offer">
          <Award size={22} />
        </div>
      </div>

      {/* 4. Rejections */}
      <div className="stat-card">
        <div className="stat-details">
          <span className="stat-label">Rejections</span>
          <span className="stat-number">{stats.rejections || 0}</span>
        </div>
        <div className="stat-icon-wrapper icon-rejected">
          <XCircle size={22} />
        </div>
      </div>
    </section>
  );
};

export default StatsOverview;
