import React from "react";

/**
 * PUBLIC_INTERFACE
 * App header displaying title and a small status indicator (loading/error).
 */
export default function AppHeader({ title, subtitle, status }) {
  return (
    <header className="appHeader">
      <div className="appHeader__brand">
        <div className="appHeader__titleRow">
          <h1 className="appHeader__title">{title}</h1>
          {status ? (
            <span className={`statusPill statusPill--${status.kind}`}>
              {status.text}
            </span>
          ) : null}
        </div>
        {subtitle ? <p className="appHeader__subtitle">{subtitle}</p> : null}
      </div>
    </header>
  );
}
