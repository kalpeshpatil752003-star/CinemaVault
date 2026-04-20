import { useState } from "react";
import GlobalWatchMap from "../components/GlobalWatchMap";
import TimeMachine from "../components/TimeMachine";
import DirectorsCut from "../components/DirectorsCut";

const TABS = [
  {
    id: "map",
    emoji: "\u{1F30D}",
    label: "Global Watch Map",
    sub: "See what the world is watching",
    color: "#e8c97a",
  },
  {
    id: "time",
    emoji: "\u{1F4FC}",
    label: "Time Machine",
    sub: "Travel through film history",
    color: "#ff40ff",
  },
  {
    id: "director",
    emoji: "\u{1F3AD}",
    label: "Director's Cut",
    sub: "Step into a director's world",
    color: "#4a90d9",
  },
];

export default function Experience() {
  const [activeTab, setActiveTab] = useState(null);

  if (!activeTab) {
    return (
      <div className="xp-landing">
        <div className="xp-landing-bg" />

        <div className="xp-landing-inner">
          <p className="xp-landing-eyebrow">CinemaVault Experience</p>
          <h1 className="xp-landing-title">
            Choose Your
            <br />
            <span className="xp-landing-accent">Cinema Mode</span>
          </h1>
          <p className="xp-landing-desc">
            Three immersive ways to explore the world of film
          </p>

          <div className="xp-landing-cards">
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                type="button"
                className="xp-lcard"
                style={{ "--card-color": tab.color, animationDelay: `${i * 0.12}s` }}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="xp-lcard-glow" />
                <span className="xp-lcard-emoji">{tab.emoji}</span>
                <h2 className="xp-lcard-label">{tab.label}</h2>
                <p className="xp-lcard-sub">{tab.sub}</p>
                <span className="xp-lcard-arrow">{"\u2192"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const active = TABS.find((tab) => tab.id === activeTab);

  return (
    <div className="xp-page">
      <div className="xp-subnav">
        <button type="button" className="xp-subnav-back" onClick={() => setActiveTab(null)}>
          {"\u2190"} All Modes
        </button>

        <div className="xp-subnav-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`xp-subnav-tab ${activeTab === tab.id ? "xp-subnav-tab--active" : ""}`}
              style={activeTab === tab.id ? { "--tab-color": tab.color } : {}}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="xp-subnav-emoji">{tab.emoji}</span>
              <span className="xp-subnav-name">{tab.label}</span>
            </button>
          ))}
        </div>

        <div
          className="xp-subnav-active-pill"
          style={{
            background: `${active.color}18`,
            borderColor: `${active.color}55`,
            color: active.color,
          }}
        >
          {active.emoji} {active.label}
        </div>
      </div>

      <div className="xp-panel">
        {activeTab === "map" && <GlobalWatchMap />}
        {activeTab === "time" && <TimeMachine />}
        {activeTab === "director" && <DirectorsCut />}
      </div>
    </div>
  );
}
