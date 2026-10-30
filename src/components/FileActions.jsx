// The files for the pose being edited; the library's files sit with the
// library, and Save sits in the top bar
export function FileActions({ onDownload, onCopy }) {
  return (
    <div className="footer-row" role="group" aria-labelledby="file-group-pose">
      <span id="file-group-pose" className="board-label">
        This pose
      </span>
      <div className="pair">
        <button className="btn" type="button" title="Download this pose as a .json file" onClick={onDownload}>
          Download
        </button>
        <button className="btn" type="button" title="Copy this pose's JSON to the clipboard" onClick={onCopy}>
          Copy JSON
        </button>
      </div>
    </div>
  );
}
