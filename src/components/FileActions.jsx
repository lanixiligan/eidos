import { useRef } from 'react';

// Save, the pose file buttons and the editor's status line
export function FileActions({ status, onSave, onDownload, onCopy, onImport, onExportAll }) {
  const fileInput = useRef(null);

  return (
    <div className="inspector-footer">
      <button className="btn btn-primary" type="button" onClick={onSave}>
        Save pose
      </button>
      <div className="file-grid">
        <button className="btn" type="button" title="Download this pose as a .json file" onClick={onDownload}>
          Download
        </button>
        <button className="btn" type="button" title="Copy this pose's JSON to the clipboard" onClick={onCopy}>
          Copy JSON
        </button>
        <button className="btn" type="button" title="Load pose .json files, or drop or paste them anywhere" onClick={() => fileInput.current.click()}>
          Import
        </button>
        <button className="btn" type="button" title="Letters and saved poses with index.json, as a zip to unzip into letters/" onClick={onExportAll}>
          Export all
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        multiple
        hidden
        onChange={(e) => {
          onImport([...e.target.files]);
          e.target.value = ''; // allow importing the same file again
        }}
      />
      <p className="hint" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
