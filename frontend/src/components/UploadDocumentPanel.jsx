import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import { apiUrl } from '../config/api.js';

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

const UploadDocumentPanel = forwardRef(function UploadDocumentPanel(
  { onUploadSuccess },
  ref
) {
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useImperativeHandle(ref, () => ({
    openFilePicker: () => {
      requestAnimationFrame(() => fileInputRef.current?.click());
    },
  }));

  const reset = useCallback(() => {
    setFile(null);
    setTitle('');
    setPhase('idle');
    setProgress(null);
    setResult(null);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setPhase('idle');
      setProgress(null);
      setResult(null);
      setErrorMessage('');
    } else if (f) {
      setErrorMessage('Please choose a PDF file.');
      setFile(null);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === 'application/pdf') {
      setFile(f);
      setPhase('idle');
      setProgress(null);
      setResult(null);
      setErrorMessage('');
    } else if (f) {
      setErrorMessage('Only PDF files are supported.');
    }
  }, []);

  const runUpload = useCallback(() => {
    if (!file) return;

    setPhase('uploading');
    setProgress(null);
    setResult(null);
    setErrorMessage('');

    const fd = new FormData();
    fd.append('file', file);
    const t = title.trim();
    if (t) fd.append('title', t);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl('/api/documents'));
    xhr.responseType = 'text';
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const doc = JSON.parse(xhr.responseText || '{}');
          setPhase('success');
          setProgress(100);
          setResult(doc);
          onUploadSuccess?.();
        } catch {
          setPhase('error');
          setProgress(null);
          setErrorMessage('Invalid server response');
        }
      } else {
        let msg = xhr.statusText;
        try {
          const j = JSON.parse(xhr.responseText || '{}');
          if (j.message) msg = j.message;
        } catch {
          /* ignore */
        }
        setPhase('error');
        setProgress(null);
        setErrorMessage(msg);
      }
    };
    xhr.onerror = () => {
      setPhase('error');
      setProgress(null);
      setErrorMessage('Network error');
    };
    xhr.send(fd);
  }, [file, title, onUploadSuccess]);

  const showProgress = phase === 'uploading' || phase === 'success' || phase === 'error';
  const indeterminate = phase === 'uploading' && progress === null;

  return (
    <div className="upload-panel">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="visually-hidden"
        onChange={onInputChange}
        aria-label="Choose PDF file"
      />

      <div className="upload-panel__intro">
        <h1 className="upload-panel__title">Upload a document</h1>
        <p className="upload-panel__lead">
          PDF only, up to 10 MB. Your file is stored securely and indexed for your pipeline.
        </p>
      </div>

      <div
        className={`upload-dropzone${dragOver ? ' upload-dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-dropzone__icon">
          <UploadCloud size={28} strokeWidth={1.5} />
        </div>
        <p className="upload-dropzone__primary">Drop a PDF here or click to browse</p>
        <p className="upload-dropzone__secondary">One file per upload</p>
      </div>

      {file && phase === 'idle' && (
        <div className="upload-file-card">
          <div className="upload-file-card__row">
            <div className="msg__icon-box msg__icon-box--accent">
              <FileText size={20} strokeWidth={1.75} />
            </div>
            <div>
              <p className="upload-file-card__name">{file.name}</p>
              <p className="upload-file-card__meta">{formatBytes(file.size)}</p>
            </div>
          </div>
          <label className="upload-field-label" htmlFor="doc-title">
            Title (optional)
          </label>
          <input
            id="doc-title"
            type="text"
            className="upload-field-input"
            placeholder="Defaults from filename"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="upload-actions">
            <button type="button" className="btn-secondary" onClick={reset}>
              Clear
            </button>
            <button type="button" className="btn-primary" onClick={runUpload}>
              Upload document
            </button>
          </div>
        </div>
      )}

      {errorMessage && phase === 'idle' && !file && (
        <p className="upload-error-banner" role="alert">
          {errorMessage}
        </p>
      )}

      {showProgress && (
        <div className="upload-progress-card">
          <div className="upload-progress-card__head">
            <span className="upload-progress-card__label">
              {phase === 'uploading' && 'Uploading…'}
              {phase === 'success' && 'Upload complete'}
              {phase === 'error' && 'Upload failed'}
            </span>
            {phase === 'uploading' && progress !== null && (
              <span className="upload-progress-card__pct">{progress}%</span>
            )}
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill${indeterminate ? ' progress-fill--indeterminate' : ''}`}
              style={{
                width: indeterminate ? undefined : `${progress ?? 0}%`,
              }}
            />
          </div>
          {file && (
            <p className="upload-progress-card__file">{file.name}</p>
          )}
          {phase === 'success' && result && (
            <div className="upload-result">
              <p>
                <strong>{result.title || 'Document'}</strong> · {result.fileName}
              </p>
              <p className="upload-result__id">
                ID: <code>{result._id || result.id}</code>
              </p>
              <button type="button" className="btn-secondary upload-result__btn" onClick={reset}>
                Upload another
              </button>
            </div>
          )}
          {phase === 'error' && (
            <div className="upload-result upload-result--error">
              <p>{errorMessage || 'Something went wrong'}</p>
              <button type="button" className="btn-secondary upload-result__btn" onClick={reset}>
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default UploadDocumentPanel;
