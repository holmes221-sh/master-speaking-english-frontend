import { useEffect, useState } from "react";
import { fetchLastEvaluation, fetchMainLevels, fetchProfileInfo, fetchSublevels, logout } from "./utilties";
import { useNavigate } from "react-router-dom";
import ConcentricProgress from "../components/ConcentricProgress";
import menuIcon from "../assets/menu.png";
import lockIcon from '../assets/lock.png';
import logoutIcon from '../assets/logout.png';
import { LoadingBar } from "../components/LoadingBar";
import { useCallback } from "react";

export function Profile({ setShowToast }) {
  const [mainLevelsValue, setMainLevelsValue] = useState([]);
  const [subLevelsValue, setSubLevelsValue] = useState({});
  const [expandedLevels, setExpandedLevels] = useState(new Set());
  const [generalErrorValue, setGeneralErrorValue] = useState(null);
  const [loadingValue, setLoadingValue] = useState(true);
  const [profileAndUserValue, setProfileAndUserValue] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLastEvaluation, setShowLastEvaluation] = useState(false);
  const [lastEvaluationValue, setLastEvaluationValue] = useState({});
  const navigate = useNavigate();
  const handleAuthRedirect = useCallback((transferReason) => {
    if (transferReason === 'must evaluat the user level first') {
      navigate('/auth/test');
      return true;
    }
    if (transferReason === 'must login first') {
      navigate("/auth/login");
      return true;
    }
    return false;
  }, [navigate]);

  useEffect(() => {
    async function whenFirstLoading() {
      const [mainLevels, userFile, lastEvaluation] = await Promise.all([
        fetchMainLevels(),
        fetchProfileInfo(),
        fetchLastEvaluation()
      ]);

      setLoadingValue(false);

      if (
        handleAuthRedirect(mainLevels?.transferReason) ||
        handleAuthRedirect(userFile?.transferReason) ||
        handleAuthRedirect(lastEvaluation?.transferReason)
      ) {
        return;
      }

      if (!mainLevels?.data || !userFile?.profile || !lastEvaluation?.data) {
        setGeneralErrorValue("Something went wrong. Try again later.");
        return;
      }

      setMainLevelsValue(mainLevels.data);
      setProfileAndUserValue({
        profile: userFile.profile,
        user: userFile.user,
      });
      setLastEvaluationValue(lastEvaluation.data);
      setGeneralErrorValue(null);
    }

    whenFirstLoading();
  }, [navigate, handleAuthRedirect]);

  async function toggleMainLevel(mainLevelId) {
    if (expandedLevels.has(mainLevelId)) {
      setExpandedLevels((prev) => {
        const updated = new Set(prev);
        updated.delete(mainLevelId);
        return updated;
      });
      return;
    }

    setExpandedLevels((prev) => new Set(prev).add(mainLevelId));
    if (subLevelsValue[mainLevelId]) return;

    setSubLevelsValue((prev) => ({
      ...prev,
      [mainLevelId]: { items: [], page: 1, hasMore: false, loading: true },
    }));

    const result = await fetchSublevels(1, mainLevelId);
    if (handleAuthRedirect(result?.transferReason)) return;

    if (!result?.subLevels) {
      setGeneralErrorValue("Something went wrong");
      return;
    }

    setSubLevelsValue((prev) => ({
      ...prev,
      [mainLevelId]: {
        items: result.subLevels,
        page: 1,
        hasMore: result.hasMore,
        loading: false,
      },
    }));
  }

  async function loadMore(mainLevelId) {
    const current = subLevelsValue[mainLevelId];
    if (!current || current.loading || !current.hasMore) return;

    setSubLevelsValue((prev) => ({
      ...prev,
      [mainLevelId]: { ...prev[mainLevelId], loading: true },
    }));

    const result = await fetchSublevels(current.page + 1, mainLevelId);
    if (handleAuthRedirect(result?.transferReason)) return;

    if (!result?.subLevels) {
      setGeneralErrorValue("Something went wrong");
      return;
    }

    setSubLevelsValue((prev) => ({
      ...prev,
      [mainLevelId]: {
        items: [...prev[mainLevelId].items, ...result.subLevels],
        page: current.page + 1,
        hasMore: result.hasMore,
        loading: false,
      },
    }));
  }

  if (loadingValue) {
    return (
      <div className="loading-screen">
        <LoadingBar />
      </div>
    );
  }

  if (generalErrorValue) {
    return <h3>{generalErrorValue}</h3>;
  }

  const currentUserSubLevelId = profileAndUserValue?.profile?.currentSubLevelId;

  return (
    <div className="page-flex">
      <header className="profile-header">

        <button className="menu-button" onClick={() => setMenuOpen(true)}>
          <img src={menuIcon} alt="menu" />
        </button>

        <div className="header-inner">
          <button
            className="overall-progress-button"
            onPointerEnter={() => setShowLastEvaluation(true)}
            onPointerLeave={() => setShowLastEvaluation(false)}
          >
            <div className="statistics-flex">

              <ConcentricProgress
                averageScore={Number(profileAndUserValue?.profile?.averageScore || 0)}
              />
              {showLastEvaluation && (
                <div className="last-evaluation-container">
                  <h2>Last Evaluation</h2>
                  <h3>pronunciation: {lastEvaluationValue?.pronunciation}%</h3>
                  <h3>grammar: {lastEvaluationValue?.grammar}%</h3>
                  <h3>vocabulary: {lastEvaluationValue?.vocabulary}%</h3>
                  <h3>fluency: {lastEvaluationValue?.fluency}%</h3>
                  <h3>coherence: {lastEvaluationValue?.coherence}%</h3>
                  <h3>strengths: {lastEvaluationValue?.strengths}</h3>
                  <h3>weaknesses: {lastEvaluationValue?.weaknesses}</h3>
                  <h3>feedback: {lastEvaluationValue?.feedback}</h3>
                </div>
              )}
            </div>
          </button>

          <div className="header-text-group">
            <h1>Master Speaking English</h1>
            <p>Your learning journey</p>
            <div className="progress-bar">
              <div
                className="filled-progress"
                style={{
                  width: `${(profileAndUserValue?.profile?.totalProgress || 0) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <button
          className="logout-button"
          style={{ height: 30 }}
          onClick={async () => {
            const result = await logout();
            switch (result) {
              case 'logedout already':
                setShowToast({ congart: false, toast: 'your session expired already', failure: true });
                navigate('/auth/login');
                break;
              case 'something went wrong':
                setShowToast({ congart: false, toast: 'something went wrong', failure: true });
                break;
              case "done":
                setShowToast({ congart: false, toast: 'logged out successfully', failure: false });
                navigate('/auth/login');
                break;
            }
          }}
        >
          <img src={logoutIcon} height="100%" alt="logout" />
        </button>
        <div className="coins-display-value profile-coins-container" style={{ cursor: "pointer" }} onClick={() => {
          navigate('/add-coins')
        }}>
          <span className="coin-icon">🪙</span>
          <span>{profileAndUserValue?.profile.remainingMessagesCount.toLocaleString()}</span>
        </div>
      </header>

      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button className="close-button" onClick={() => setMenuOpen(false)}>
          ✕
        </button>
        <div className="coins-display-value mobile-profile-coins-container" style={{ cursor: "pointer" }} onClick={() => {
          navigate('/add-coins')
        }}>
          <span className="coin-icon">🪙</span>
          <span>{profileAndUserValue?.profile.remainingMessagesCount.toLocaleString()}</span>
        </div>
        <div className="statistics-flex-nav">
          <ConcentricProgress
            averageScore={Number(profileAndUserValue?.profile?.averageScore || 0)}
          />
          <h2>Last Evaluation</h2>
          <h3>pronunciation: {lastEvaluationValue?.pronunciation}%</h3>
          <h3>grammar: {lastEvaluationValue?.grammar}%</h3>
          <h3>vocabulary: {lastEvaluationValue?.vocabulary}%</h3>
          <h3>fluency: {lastEvaluationValue?.fluency}%</h3>
          <h3>coherence: {lastEvaluationValue?.coherence}%</h3>
          <h3>strengths: {lastEvaluationValue?.strengths}</h3>
          <h3>weaknesses: {lastEvaluationValue?.weaknesses}</h3>
          <h3>feedback: {lastEvaluationValue?.feedback}</h3>
        </div>
      </nav>

      <main className="levels-map">
        {mainLevelsValue.map((mainLevel, index) => {
          const currentSubLevels = subLevelsValue[mainLevel._id];

          return (
            <section
              key={mainLevel._id}
              className={`level-container level-${index % 2}`}
            >
              <button
                className="main-level-button"
                onClick={() => toggleMainLevel(mainLevel._id)}
              >
                {mainLevel.name}
              </button>

              {expandedLevels.has(mainLevel._id) && (
                <div className="sub-level-map">
                  {currentSubLevels?.loading && !currentSubLevels?.items.length && (
                    <LoadingBar small />
                  )}

                  {currentSubLevels?.items.map((subLevel, subIndex) => {
                    const isCurrent = currentUserSubLevelId === subLevel._id;

                    // Safely check unlocked status against current items array
                    const userActiveLevelInGroup = currentSubLevels.items.find(
                      (level) => level._id === currentUserSubLevelId
                    );

                    const isUnlocked = userActiveLevelInGroup
                      ? subLevel.number <= userActiveLevelInGroup.number
                      : true; // Default fallback state

                    if (isUnlocked) {
                      return (
                        <button
                          key={subLevel._id}
                          className={`sub-level-button sub-${subIndex % 2} ${isCurrent ? "current-sub-level" : ""
                            }`}
                          onClick={() => navigate(`/profile/sub-level/${subLevel._id}`)}
                        >
                          {subLevel.number}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={subLevel._id}
                        className={`sub-level-button sub-${subIndex % 2}`}
                      >
                        <img src={lockIcon} alt="Locked" />
                        <h4>{subLevel.number}</h4>
                      </button>
                    );
                  })}

                  {currentSubLevels?.hasMore && (
                    currentSubLevels.loading ? (
                      <LoadingBar small={true} />
                    ) : (
                      <button
                        className="more-button"
                        onClick={() => loadMore(mainLevel._id)}
                        disabled={currentSubLevels.loading}
                      >
                        More
                      </button>
                    )
                  )}
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}