"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  FileImage,
  FileCode,
  File,
  Trash2,
  Download,
  Search,
  X,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: "ready" | "processing";
}

const MOCK_FILES: UploadedFile[] = [
  {
    id: "1",
    name: "Q3_Financial_Report.pdf",
    size: 2400000,
    type: "application/pdf",
    uploadedAt: new Date("2026-06-10T09:30:00"),
    status: "ready",
  },
  {
    id: "2",
    name: "integration_schema.json",
    size: 45000,
    type: "application/json",
    uploadedAt: new Date("2026-06-11T14:15:00"),
    status: "ready",
  },
  {
    id: "3",
    name: "system_architecture.png",
    size: 890000,
    type: "image/png",
    uploadedAt: new Date("2026-06-12T11:00:00"),
    status: "ready",
  },
  {
    id: "4",
    name: "api_documentation.md",
    size: 128000,
    type: "text/markdown",
    uploadedAt: new Date("2026-06-13T16:45:00"),
    status: "ready",
  },
  {
    id: "5",
    name: "user_data_export.csv",
    size: 3100000,
    type: "text/csv",
    uploadedAt: new Date("2026-06-14T08:20:00"),
    status: "processing",
  },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

function FileIcon({ type, size = 18 }: { type: string; size?: number }) {
  const cls = `w-[${size}px] h-[${size}px]`;
  if (type.includes("pdf"))
    return <FileText className={cls} style={{ color: "#f87171" }} />;
  if (type.includes("image"))
    return <FileImage className={cls} style={{ color: "#60a5fa" }} />;
  if (type.includes("json") || type.includes("code"))
    return <FileCode className={cls} style={{ color: "#a78bfa" }} />;
  if (type.includes("csv") || type.includes("text"))
    return <FileText className={cls} style={{ color: "#34d399" }} />;
  return (
    <File className={cls} style={{ color: "var(--color-text-tertiary)" }} />
  );
}

interface ModalFile {
  file: File;
  id: string;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
}

export default function FilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>(MOCK_FILES);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [modalFiles, setModalFiles] = useState<ModalFile[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Drop zone handlers ──
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addModalFiles(Array.from(e.dataTransfer.files));
  }, []);

  function addModalFiles(incoming: File[]) {
    const newEntries: ModalFile[] = incoming.map((f) => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      progress: 0,
      status: "idle",
    }));
    setModalFiles((prev) => [...prev, ...newEntries]);
  }

  function removeModalFile(id: string) {
    setModalFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleUpload() {
    if (modalFiles.length === 0) return;

    // Simulate upload progress per file
    for (const mf of modalFiles) {
      setModalFiles((prev) =>
        prev.map((f) => (f.id === mf.id ? { ...f, status: "uploading" } : f)),
      );
      for (let p = 10; p <= 100; p += 10) {
        await new Promise((r) => setTimeout(r, 80));
        setModalFiles((prev) =>
          prev.map((f) => (f.id === mf.id ? { ...f, progress: p } : f)),
        );
      }
      setModalFiles((prev) =>
        prev.map((f) => (f.id === mf.id ? { ...f, status: "done" } : f)),
      );

      // Add to file list
      const newFile: UploadedFile = {
        id: mf.id,
        name: mf.file.name,
        size: mf.file.size,
        type: mf.file.type || "application/octet-stream",
        uploadedAt: new Date(),
        status: "ready",
      };
      setFiles((prev) => [newFile, ...prev]);
    }

    setTimeout(() => {
      setShowModal(false);
      setModalFiles([]);
    }, 800);
  }

  function handleDelete(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDeleteId(null);
  }

  return (
    <div
      className="flex flex-col flex-1 min-w-0 h-full"
      style={{ background: "var(--color-bg-tertiary)" }}
    >
      {/* ── Top bar ── */}
      <div className="nav-glass flex items-center justify-between px-6 py-3 shrink-0 min-h-[52px]">
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-secondary)" }}
        >
          File Manager
        </span>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-gradient"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </motion.button>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Files", value: files.length },
            {
              label: "Storage Used",
              value: formatBytes(files.reduce((a, f) => a + f.size, 0)),
            },
            {
              label: "Processing",
              value: files.filter((f) => f.status === "processing").length,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.07,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="glass-card px-5 py-4 rounded-2xl"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border-tertiary)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <p
                className="text-[11px] font-medium mb-1"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {stat.label}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-5"
          style={{
            background: "var(--color-bg-primary)",
            border: "1px solid var(--color-border-secondary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Search
            className="w-4 h-4 shrink-0"
            style={{ color: "var(--color-text-tertiary)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{
              color: "var(--color-text-primary)",
              caretColor: "var(--color-primary)",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X
                className="w-4 h-4"
                style={{ color: "var(--color-text-tertiary)" }}
              />
            </button>
          )}
        </div>

        {/* File list */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-3"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-secondary)",
                  }}
                >
                  <File
                    className="w-6 h-6"
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {search
                    ? "No files match your search"
                    : "No files uploaded yet"}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {search
                    ? "Try a different keyword"
                    : "Click &ldquo; Upload File &rdquo; to get started"}
                </p>
              </motion.div>
            ) : (
              filtered.map((file, i) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    delay: i * 0.04,
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl group transition-all duration-150"
                  style={{
                    background: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-tertiary)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--color-border-secondary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--color-border-tertiary)")
                  }
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "var(--color-bg-secondary)",
                      border: "1px solid var(--color-border-secondary)",
                    }}
                  >
                    <FileIcon type={file.type} size={18} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {file.name}
                    </p>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {formatBytes(file.size)} · {timeAgo(file.uploadedAt)}
                    </p>
                  </div>

                  {/* Status badge */}
                  {file.status === "processing" ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium badge-info shrink-0">
                      Processing
                    </span>
                  ) : (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{
                        background: "rgba(52,211,153,0.12)",
                        color: "#34d399",
                        border: "1px solid rgba(52,211,153,0.25)",
                      }}
                    >
                      Ready
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: "var(--color-text-tertiary)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color =
                          "var(--color-text-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          "var(--color-text-tertiary)")
                      }
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteId(file.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: "var(--color-text-tertiary)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#f87171")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          "var(--color-text-tertiary)")
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ════════════════════════════════
          UPLOAD MODAL
          ════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowModal(false);
                setModalFiles([]);
              }}
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-lg rounded-2xl pointer-events-auto flex flex-col overflow-hidden"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-secondary)",
                  boxShadow: "var(--shadow-md)",
                  maxHeight: "85vh",
                }}
              >
                {/* Modal header */}
                <div
                  className="flex items-center justify-between px-6 py-4 shrink-0"
                  style={{
                    borderBottom: "1px solid var(--color-border-tertiary)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center btn-gradient">
                      <CloudUpload className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Upload Files
                      </h3>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        Drag & drop or browse to upload
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowModal(false);
                      setModalFiles([]);
                    }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      background: "var(--color-bg-secondary)",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Modal body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
                  {/* Drop zone */}
                  <motion.div
                    animate={{
                      borderColor: isDragging
                        ? "var(--color-primary)"
                        : "var(--color-border-secondary)",
                      background: isDragging
                        ? "rgba(139,92,246,0.08)"
                        : "var(--color-bg-secondary)",
                    }}
                    transition={{ duration: 0.15 }}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex flex-col items-center justify-center gap-3 py-10 rounded-xl cursor-pointer transition-all"
                    style={{
                      border: "2px dashed var(--color-border-secondary)",
                      background: "var(--color-bg-secondary)",
                    }}
                  >
                    {/* Glow when dragging */}
                    {isDragging && (
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          boxShadow: "inset 0 0 0 2px var(--color-primary)",
                          background: "rgba(139,92,246,0.06)",
                        }}
                      />
                    )}

                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{
                        background: isDragging
                          ? "var(--gradient-brand)"
                          : "var(--color-bg-primary)",
                        border: "1px solid var(--color-border-secondary)",
                        transition: "all 0.2s",
                      }}
                    >
                      <CloudUpload
                        className="w-5 h-5"
                        style={{
                          color: isDragging
                            ? "#fff"
                            : "var(--color-text-tertiary)",
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {isDragging
                          ? "Drop files here"
                          : "Drag & drop files here"}
                      </p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        or{" "}
                        <span className="gradient-text font-semibold cursor-pointer">
                          browse files
                        </span>
                      </p>
                    </div>
                    <p
                      className="text-[10px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      PDF, JSON, CSV, PNG, MD — up to 50 MB each
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        addModalFiles(Array.from(e.target.files ?? []))
                      }
                    />
                  </motion.div>

                  {/* Queued files */}
                  <AnimatePresence initial={false}>
                    {modalFiles.map((mf) => (
                      <motion.div
                        key={mf.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{
                          background: "var(--color-bg-secondary)",
                          border: "1px solid var(--color-border-tertiary)",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "var(--color-bg-primary)" }}
                        >
                          <FileIcon type={mf.file.type} size={16} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-medium truncate"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {mf.file.name}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            {formatBytes(mf.file.size)}
                          </p>

                          {/* Progress bar */}
                          {mf.status === "uploading" && (
                            <div
                              className="mt-1.5 h-1 rounded-full overflow-hidden"
                              style={{ background: "var(--color-bg-primary)" }}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: "var(--gradient-brand)" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${mf.progress}%` }}
                                transition={{ duration: 0.1 }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Status icon */}
                        <div className="shrink-0">
                          {mf.status === "done" ? (
                            <CheckCircle2
                              className="w-4 h-4"
                              style={{ color: "#34d399" }}
                            />
                          ) : mf.status === "error" ? (
                            <AlertCircle
                              className="w-4 h-4"
                              style={{ color: "#f87171" }}
                            />
                          ) : mf.status === "uploading" ? (
                            <span
                              className="text-[10px] font-medium"
                              style={{ color: "var(--color-primary)" }}
                            >
                              {mf.progress}%
                            </span>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => removeModalFile(mf.id)}
                              style={{ color: "var(--color-text-tertiary)" }}
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Modal footer */}
                <div
                  className="flex items-center justify-between px-6 py-4 shrink-0 gap-3"
                  style={{
                    borderTop: "1px solid var(--color-border-tertiary)",
                  }}
                >
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {modalFiles.length === 0
                      ? "No files selected"
                      : `${modalFiles.length} file${modalFiles.length > 1 ? "s" : ""} ready to upload`}
                  </p>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowModal(false);
                        setModalFiles([]);
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
                      style={{
                        background: "var(--color-bg-secondary)",
                        border: "1px solid var(--color-border-secondary)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpload}
                      disabled={
                        modalFiles.length === 0 ||
                        modalFiles.some((f) => f.status === "uploading")
                      }
                      className="px-4 py-2 text-sm font-semibold rounded-xl text-white btn-gradient transition-opacity disabled:opacity-40"
                      style={{ boxShadow: "var(--shadow-glow)" }}
                    >
                      Upload{" "}
                      {modalFiles.length > 0 ? `(${modalFiles.length})` : ""}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════
          DELETE CONFIRM MODAL
          ════════════════════════════════ */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-sm rounded-2xl p-6 pointer-events-auto"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-secondary)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(248,113,113,0.12)",
                      border: "1px solid rgba(248,113,113,0.25)",
                    }}
                  >
                    <Trash2 className="w-5 h-5" style={{ color: "#f87171" }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Delete file?
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <p
                  className="text-xs mb-5"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {files.find((f) => f.id === deleteId)?.name}
                  </span>{" "}
                  will be permanently removed from your workspace.
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteId(null)}
                    className="flex-1 py-2 text-sm font-medium rounded-xl"
                    style={{
                      background: "var(--color-bg-secondary)",
                      border: "1px solid var(--color-border-secondary)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(deleteId)}
                    className="flex-1 py-2 text-sm font-semibold rounded-xl text-white"
                    style={{
                      background: "linear-gradient(135deg,#ef4444,#dc2626)",
                      boxShadow: "0 0 16px rgba(239,68,68,0.35)",
                    }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
