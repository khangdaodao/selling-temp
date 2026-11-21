/**
 * Lazy-loaded, read-only Monaco Source Viewer for forma/ Phase 1.
 * Dynamically imports `@monaco-editor/react` with `ssr: false` so the Monaco bundle
 * is excluded from server rendering and initial catalog loads.
 * Features a file tree sidebar, in-code search with jump-to-line matches, syntax highlighting,
 * copy-to-clipboard button, fullscreen toggle, and explicit Demo Source Fixture notice.
 *
 * Security boundary: Displays sanitized Phase 1 sample fixtures only. Real paid source bundles
 * are never stored in client code and require server authorization in Phase 2.
 *
 * Related: src/features/account/components/account-view.tsx, src/features/product-detail/components/product-detail-view.tsx
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';
import {
  Check,
  Copy,
  FileCode2,
  FolderTree,
  Lock,
  Maximize2,
  Minimize2,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n/use-i18n-store';
import type { Product, ProductCodeFile } from '@/types/domain';

type MonacoEditorInstance = Parameters<OnMount>[0];

const LazyMonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: function MonacoLoadingFallback() {
      return (
        <div className="flex h-[360px] w-full flex-col items-center justify-center gap-3 bg-[#09090d] p-6 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-accent-cyan" />
          <p className="font-mono text-xs text-zinc-400">
            Loading Monaco Editor...
          </p>
        </div>
      );
    },
  },
);

function mapLanguageForMonaco(lang: ProductCodeFile['language']): string {
  switch (lang) {
    case 'tsx':
    case 'ts':
      return 'typescript';
    case 'md':
      return 'markdown';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    default:
      return 'plaintext';
  }
}

interface SearchMatch {
  lineNumber: number;
  previewText: string;
}

interface MonacoCodeViewerProps {
  product: Product;
}

/**
 * Interactive read-only code explorer for owned demo products.
 */
export function MonacoCodeViewer({
  product,
}: MonacoCodeViewerProps): React.JSX.Element {
  const { t } = useI18n();
  const [selectedPath, setSelectedPath] = useState<string>(
    product.codeBundle[0]?.path ?? '',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const editorRef = useRef<MonacoEditorInstance | null>(null);

  const activeFile = useMemo(
    () =>
      product.codeBundle.find((file) => file.path === selectedPath) ??
      product.codeBundle[0] ??
      null,
    [product.codeBundle, selectedPath],
  );

  useEffect(() => {
    setSelectedPath(product.codeBundle[0]?.path ?? '');
    setSearchQuery('');
  }, [product.id, product.codeBundle]);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreen]);

  const matchCountsByFile = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const counts = new Map<string, number>();
    if (!query) {
      return counts;
    }
    for (const file of product.codeBundle) {
      const lines = file.content.split('\n');
      let matchCount = 0;
      for (const line of lines) {
        if (line.toLowerCase().includes(query)) {
          matchCount += 1;
        }
      }
      counts.set(file.path, matchCount);
    }
    return counts;
  }, [product.codeBundle, searchQuery]);

  const activeFileMatches = useMemo<SearchMatch[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query || !activeFile) {
      return [];
    }
    const matches: SearchMatch[] = [];
    const lines = activeFile.content.split('\n');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query)) {
        matches.push({
          lineNumber: index + 1,
          previewText: line.trim(),
        });
      }
    });
    return matches;
  }, [activeFile, searchQuery]);

  const handleCopyCode = async (): Promise<void> => {
    if (!activeFile || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API may be blocked in restricted contexts; fail gracefully.
    }
  };

  const handleJumpToLine = (lineNumber: number): void => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    editor.revealLineInCenter(lineNumber);
    editor.setPosition({ lineNumber, column: 1 });
    editor.focus();
  };

  if (!activeFile) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-6 text-xs text-zinc-400">
        No source files available in this demo bundle.
      </div>
    );
  }

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-[#050507] p-4 sm:p-6'
          : 'overflow-hidden rounded-2xl border border-white/10 bg-[#08080b]'
      }
      role={fullscreen ? 'dialog' : undefined}
      aria-modal={fullscreen ? 'true' : undefined}
      aria-label={`${t.codeViewer.title}: ${product.name}`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0e0e13] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-white">
            {product.name}
          </span>
          <Badge variant="cyan" className="text-[10px]">
            <Lock className="h-2.5 w-2.5" aria-hidden="true" />
            <span>{t.codeViewer.readOnlyBadge}</span>
          </Badge>
          <Badge variant="muted" className="hidden text-[10px] sm:inline-flex">
            {t.codeViewer.demoFixtureBadge}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
              aria-hidden="true"
            />
            <input
              id={`monaco-search-${product.id}`}
              name="codeSearch"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.codeViewer.searchPlaceholder}
              aria-label={t.codeViewer.searchPlaceholder}
              className="h-8 w-44 rounded-md border border-white/10 bg-[#09090c] pl-8 pr-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-accent-cyan focus:outline-none sm:w-52"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleCopyCode()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-surface px-2.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-accent-cyan" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{copied ? t.codeViewer.copiedCta : t.codeViewer.copyCta}</span>
          </button>

          <button
            type="button"
            onClick={() => setFullscreen((prev) => !prev)}
            aria-label={
              fullscreen ? t.codeViewer.fullscreenExit : t.codeViewer.fullscreenEnter
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-surface px-2.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
          >
            {fullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {fullscreen ? t.codeViewer.fullscreenExit : t.codeViewer.fullscreenEnter}
            </span>
          </button>
        </div>
      </div>

      {/* Main Tree + Monaco Stage */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 ${
          fullscreen ? 'flex-1 overflow-hidden' : ''
        }`}
      >
        {/* File Tree Sidebar */}
        <aside className="border-b border-white/[0.08] bg-[#0a0a0e] p-3 lg:col-span-4 lg:border-b-0 lg:border-r xl:col-span-3">
          <div className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <FolderTree className="h-3 w-3" aria-hidden="true" />
            <span>{t.codeViewer.filesHeading}</span>
          </div>
          <ul className="space-y-1">
            {product.codeBundle.map((file) => {
              const active = file.path === activeFile.path;
              const fileMatches = matchCountsByFile.get(file.path) ?? 0;
              return (
                <li key={file.path}>
                  <button
                    type="button"
                    onClick={() => setSelectedPath(file.path)}
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left font-mono text-xs transition-colors ${
                      active
                        ? 'bg-accent-cyan/15 text-accent-cyan font-semibold'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileCode2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{file.path}</span>
                    </span>
                    {searchQuery.trim().length > 0 && fileMatches > 0 ? (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white">
                        {fileMatches}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Line match jump list */}
          {searchQuery.trim().length > 0 ? (
            <div className="mt-4 border-t border-white/[0.08] pt-3">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {activeFileMatches.length} {t.codeViewer.matchesLabel}
              </p>
              {activeFileMatches.length === 0 ? (
                <p className="mt-1.5 px-2 text-[11px] text-zinc-500">
                  {t.codeViewer.noMatches}
                </p>
              ) : (
                <ul className="mt-1.5 max-h-40 space-y-1 overflow-y-auto">
                  {activeFileMatches.map((match) => (
                    <li key={match.lineNumber}>
                      <button
                        type="button"
                        onClick={() => handleJumpToLine(match.lineNumber)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1 text-left font-mono text-[11px] text-zinc-300 hover:bg-white/5 hover:text-accent-cyan"
                      >
                        <span className="shrink-0 text-accent-cyan">
                          L{match.lineNumber}
                        </span>
                        <span className="truncate">{match.previewText}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </aside>

        {/* Monaco Read-only Editor */}
        <div className="flex flex-col lg:col-span-8 xl:col-span-9">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0b0b10] px-4 py-1.5 font-mono text-[11px] text-zinc-400">
            <span>{activeFile.path}</span>
            <span className="uppercase text-zinc-500">{activeFile.language}</span>
          </div>
          <div className={fullscreen ? 'flex-1 min-h-[380px]' : 'h-[360px]'}>
            <LazyMonacoEditor
              height="100%"
              theme="vs-dark"
              path={activeFile.path}
              language={mapLanguageForMonaco(activeFile.language)}
              value={activeFile.content}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                readOnly: true,
                domReadOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>
      </div>

      {/* Security Notice Strip */}
      <div className="flex items-start gap-2 border-t border-white/[0.08] bg-[#0a0a0e] px-4 py-2.5 text-[11px] text-zinc-400">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-cyan" aria-hidden="true" />
        <p>{t.codeViewer.securityNote}</p>
      </div>
    </div>
  );
}
