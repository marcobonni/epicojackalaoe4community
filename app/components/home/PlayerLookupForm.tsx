"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { useNavigationLoader } from "@/app/components/NavigationLoaderProvider";
import { useTranslations } from "@/app/components/LanguageProvider";

const API_BASE = "https://aoe4world.com/api/v0";
const AUTOCOMPLETE_MIN_CHARS = 2;
const AUTOCOMPLETE_LIMIT = 6;
const AUTOCOMPLETE_DEBOUNCE_MS = 220;

type PlayerSearchCandidate = {
  profile_id?: number | string | null;
  profileId?: number | string | null;
  id?: number | string | null;
  name?: string | null;
  nickname?: string | null;
  alias?: string | null;
};

type ResolvedPlayer = {
  profileId: number;
  name: string | null;
};

type PlayerLookupFormProps = {
  variant?: "default" | "compact";
};

function toNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getSearchCandidates(payload: unknown): PlayerSearchCandidate[] {
  if (Array.isArray(payload)) return payload as PlayerSearchCandidate[];
  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      players?: PlayerSearchCandidate[];
      data?: PlayerSearchCandidate[];
    };

    if (Array.isArray(typedPayload.players)) return typedPayload.players;
    if (Array.isArray(typedPayload.data)) return typedPayload.data;
  }

  return [];
}

function normalizeSearchResults(payload: unknown): ResolvedPlayer[] {
  const normalized = getSearchCandidates(payload)
    .map((candidate) => ({
      profileId:
        toNullableNumber(candidate.profile_id) ??
        toNullableNumber(candidate.profileId) ??
        toNullableNumber(candidate.id),
      name: candidate.name ?? candidate.nickname ?? candidate.alias ?? null,
    }))
    .filter((candidate): candidate is ResolvedPlayer => candidate.profileId !== null);

  return Array.from(
    new Map(normalized.map((candidate) => [candidate.profileId, candidate])).values()
  );
}

function pickBestSearchResult(
  query: string,
  candidates: ResolvedPlayer[]
): ResolvedPlayer | null {
  if (candidates.length === 0) return null;

  const loweredQuery = query.trim().toLowerCase();
  const exactMatch = candidates.find(
    (candidate) => candidate.name?.toLowerCase() === loweredQuery
  );

  if (exactMatch) return exactMatch;

  const prefixMatch = candidates.find((candidate) =>
    candidate.name?.toLowerCase().startsWith(loweredQuery)
  );

  return prefixMatch ?? candidates[0];
}

async function fetchPlayerSearchResults(
  query: string,
  errorMessages: PlayerLookupFormErrors,
  signal?: AbortSignal
): Promise<ResolvedPlayer[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    throw new Error(errorMessages.emptySearch);
  }

  const response = await fetch(
    `${API_BASE}/players/search?query=${encodeURIComponent(trimmed)}`,
    { cache: "no-store", signal }
  );

  if (!response.ok) {
    throw new Error(errorMessages.searchUnavailable);
  }

  const payload = await response.json();
  return normalizeSearchResults(payload);
}

async function resolvePlayerProfileId(
  query: string,
  errorMessages: PlayerLookupFormErrors,
  cachedCandidates?: ResolvedPlayer[]
) {
  const candidates =
    cachedCandidates && cachedCandidates.length > 0
      ? cachedCandidates
      : await fetchPlayerSearchResults(query, errorMessages);

  if (candidates.length === 0) {
    throw new Error(errorMessages.noPlayer);
  }

  const bestCandidate = pickBestSearchResult(query, candidates);

  if (!bestCandidate) {
    throw new Error(errorMessages.noPlayer);
  }

  return bestCandidate;
}

type PlayerLookupFormErrors = {
  emptySearch: string;
  searchUnavailable: string;
  noPlayer: string;
  openPlayer: string;
  generic: string;
};

export default function PlayerLookupForm({
  variant = "default",
}: PlayerLookupFormProps) {
  const router = useRouter();
  const { startLoading } = useNavigationLoader();
  const messages = useTranslations();
  const copy = messages.home.playerLookup;
  const inputId = useId();
  const suggestionsId = `${inputId}-suggestions`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<ResolvedPlayer[]>([]);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const isBusy = isSearching || isPending;
  const isCompact = variant === "compact";
  const shouldShowAutocomplete =
    isAutocompleteOpen &&
    query.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
    (isAutocompleteLoading || suggestions.length > 0 || !error);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < AUTOCOMPLETE_MIN_CHARS) {
      setSuggestions([]);
      setHighlightedIndex(-1);
      setIsAutocompleteLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsAutocompleteLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const nextSuggestions = await fetchPlayerSearchResults(
          trimmedQuery,
          copy.lookupErrors,
          controller.signal
        );

        setSuggestions(nextSuggestions.slice(0, AUTOCOMPLETE_LIMIT));
        setHighlightedIndex(nextSuggestions.length > 0 ? 0 : -1);
      } catch (autocompleteError) {
        if (
          autocompleteError instanceof Error &&
          autocompleteError.name === "AbortError"
        ) {
          return;
        }

        setSuggestions([]);
        setHighlightedIndex(-1);
      } finally {
        if (!controller.signal.aborted) {
          setIsAutocompleteLoading(false);
        }
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [copy.lookupErrors, query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsAutocompleteOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function navigateToPlayer(player: ResolvedPlayer) {
    setQuery(player.name ?? query);
    setIsAutocompleteOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
    startLoading();

    startTransition(() => {
      router.push(`/player/${player.profileId}`);
    });
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isAutocompleteOpen || suggestions.length === 0) {
      if (event.key === "ArrowDown" && suggestions.length > 0) {
        event.preventDefault();
        setIsAutocompleteOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((currentIndex) =>
        Math.min(currentIndex + 1, suggestions.length - 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((currentIndex) => Math.max(currentIndex - 1, 0));
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsAutocompleteOpen(false);
      setHighlightedIndex(-1);
    }

    if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      navigateToPlayer(suggestions[highlightedIndex]);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError(copy.lookupErrors.openPlayer);
      return;
    }

    setError(null);
    setIsSearching(true);
    setIsAutocompleteOpen(false);

    try {
      const cachedCandidate = pickBestSearchResult(trimmedQuery, suggestions);
      const resolvedPlayer = await resolvePlayerProfileId(
        trimmedQuery,
        copy.lookupErrors,
        cachedCandidate ? suggestions : undefined
      );
      setIsSearching(false);
      navigateToPlayer(resolvedPlayer);
    } catch (submissionError) {
      setIsSearching(false);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : copy.lookupErrors.generic
      );
    }
  }

  const inputBlock = (
    <div
      ref={containerRef}
      role="combobox"
      aria-expanded={shouldShowAutocomplete}
      aria-haspopup="listbox"
      aria-controls={suggestionsId}
      className="group relative flex-1"
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition group-focus-within:text-amber-300" />
      <input
        id={inputId}
        type="text"
        value={query}
        autoComplete="off"
        aria-autocomplete="list"
        aria-activedescendant={
          highlightedIndex >= 0
            ? `${inputId}-option-${suggestions[highlightedIndex]?.profileId}`
            : undefined
        }
        onChange={(event) => {
          setQuery(event.target.value);
          setIsAutocompleteOpen(true);
          if (error) {
            setError(null);
          }
        }}
        onFocus={() => {
          if (query.trim().length >= AUTOCOMPLETE_MIN_CHARS) {
            setIsAutocompleteOpen(true);
          }
        }}
        onKeyDown={handleInputKeyDown}
        placeholder={
          isCompact ? copy.compactPlaceholder : copy.defaultPlaceholder
        }
        className={`w-full rounded-2xl border border-white/10 bg-[rgba(14,23,40,0.92)] text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/50 focus:bg-[rgba(20,31,52,0.96)] ${
          isCompact ? "py-3.5 pl-11 pr-12" : "py-4 pl-11 pr-12"
        }`}
      />

      {isAutocompleteLoading ? (
        <Loader2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-amber-300" />
      ) : null}

      {shouldShowAutocomplete ? (
        <div
          id={suggestionsId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,40,0.98),rgba(21,32,51,0.98))] shadow-[0_22px_60px_rgba(2,6,23,0.45)]"
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={suggestion.profileId}
                  id={`${inputId}-option-${suggestion.profileId}`}
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => navigateToPlayer(suggestion)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                    isHighlighted
                      ? "bg-amber-400/10 text-white"
                      : "text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {suggestion.name ?? `Player ${suggestion.profileId}`}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      Profile ID {suggestion.profileId}
                    </span>
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-300">
                    {copy.suggestionOpen}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-4 text-sm text-slate-400">
              {copy.suggestionEmptyPrefix}{" "}
              <span className="text-slate-200">{query.trim()}</span>.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  const submitButton = (
    <button
      type="submit"
      disabled={isBusy}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,#facc15,#f59e0b)] text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(245,158,11,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(245,158,11,0.32)] disabled:cursor-not-allowed disabled:opacity-70 ${
        isCompact
          ? "min-h-[52px] px-5 py-3 sm:min-w-[150px]"
          : "min-h-[56px] px-6 py-4 sm:min-w-[176px]"
      }`}
    >
      {isBusy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {copy.submitPending}
        </>
      ) : (
        copy.submit
      )}
    </button>
  );

  if (isCompact) {
    return (
      <section className="rounded-[1.75rem] border border-amber-300/16 bg-[linear-gradient(135deg,rgba(16,25,42,0.96),rgba(24,36,58,0.94)_56%,rgba(48,28,21,0.82))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/90">
              {copy.compactBadge}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">{copy.compactTitle}</h2>
          </div>

          <form onSubmit={handleSubmit} className="w-full lg:max-w-3xl">
            <label htmlFor={inputId} className="sr-only">
              {copy.label}
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              {inputBlock}
              {submitButton}
            </div>
          </form>
        </div>

        {error ? <p aria-live="polite" className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-amber-300/18 bg-[linear-gradient(135deg,rgba(18,28,47,0.98),rgba(25,37,59,0.96)_50%,rgba(70,39,24,0.84))] shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />

        <div className="relative grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.9fr)] lg:items-center lg:px-10 lg:py-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300/90">
              {copy.defaultBadge}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {copy.title}
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              {copy.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1.5">
                {copy.chipSearch}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {copy.chipDashboard}
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] blur-2xl" />

            <form
              onSubmit={handleSubmit}
              className="relative rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(21,31,49,0.82),rgba(17,25,41,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur md:p-5"
            >
              <label htmlFor={inputId} className="sr-only">
                {copy.label}
              </label>

              <div className="rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(26,37,58,0.96),rgba(17,26,43,0.96))] p-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  {inputBlock}
                  {submitButton}
                </div>
              </div>

              <p className="mt-4 text-xs leading-6 text-slate-400">{copy.helper}</p>

              {error ? (
                <p aria-live="polite" className="mt-3 text-sm text-rose-300">
                  {error}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
