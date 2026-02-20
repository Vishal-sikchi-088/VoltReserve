function HelpModal({
  open,
  loading,
  error,
  content,
  onClose,
  headerLabel,
  headerTitle
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="station-modal-backdrop">
      <div className="station-modal help-modal">
        <div className="station-modal-header">
          <div>
            <div className="metric-label">{headerLabel}</div>
            <div className="station-modal-title">{headerTitle}</div>
          </div>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {loading && (
          <p className="section-body">Loading guide…</p>
        )}
        {error && <p className="section-body">{error}</p>}
        {!loading && !error && content && (
          <div className="help-markdown">
            {content.split("\n").map((line, index) => {
              const key = `help-line-${index}`;
              if (line.startsWith("### ")) {
                return (
                  <h3 key={key}>{line.replace(/^### /, "")}</h3>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h2 key={key}>{line.replace(/^## /, "")}</h2>
                );
              }
              if (line.startsWith("!-")) {
                return null;
              }
              const imageMatch = line.match(/^!\[(.*)\]\((.*)\)/);
              if (imageMatch) {
                const alt = imageMatch[1] || "";
                let src = imageMatch[2] || "";
                if (src && !src.startsWith("/")) {
                  src = `/${src}`;
                }
                return (
                  <div key={key} className="help-image-wrapper">
                    <img
                      src={src}
                      alt={alt}
                      className="help-image"
                    />
                  </div>
                );
              }
              if (line.startsWith("- ")) {
                return (
                  <p key={key}>• {line.slice(2)}</p>
                );
              }
              if (line.startsWith("> ")) {
                return (
                  <p key={key} className="help-quote">
                    {line.slice(2)}
                  </p>
                );
              }
              if (line.trim() === "") {
                return <br key={key} />;
              }
              return <p key={key}>{line}</p>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

HelpModal.defaultProps = {
  headerLabel: "Help",
  headerTitle: "Help"
};

export default HelpModal;
