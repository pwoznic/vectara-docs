import {
  ChangeEvent,
  FC,
  useCallback,
  useState,
  KeyboardEvent as ReactKeyboardEvent,
  useRef,
  useEffect,
  useMemo,
} from "react";
import getUuid from "uuid-by-string";
import { BrowserRouter } from "react-router-dom";
import debounce from "lodash.debounce";
import { BiSearch } from "react-icons/bi";
import {
  VuiButtonSecondary,
  VuiFlexContainer,
  VuiFlexItem,
  VuiIcon,
  VuiText,
  VuiTextColor,
} from "../../../vui";
import { DeserializedSearchResult } from "./types";
import { useSearch } from "./useSearch";
import { SearchResult } from "./SearchResult";
import { SearchModal } from "./SearchModal";

import "./_index.scss";
import { useSearchHistory } from "./useSearchHistory";

interface Props {
  // Vectara customer ID
  customerId: string;

  // Vectara API key
  apiKey: string;

  // Vectara corpus ID
  corpusId: string;

  // An optional API url to direct requests toward
  apiUrl?: string;

  // The number of previous searches to cache.
  // Default is 0.
  historySize?: number;
}

/**
 * A client-side search component that queries a specific corpus with a user-provided string.
 */
export const Search: FC<Props> = ({
  customerId,
  apiKey,
  corpusId,
  apiUrl,
  historySize = 10,
}) => {
  const [searchResults, setSearchResults] = useState<
    DeserializedSearchResult[]
  >([]);

  // Compute a unique ID for this search component.
  // This creates a namespace, and ensures that stored search results
  // for one search box don't appear for another.
  // NOTE: This is an implementation for what's historically been found to be
  // an issue with persistent search history: overlap between the histories
  // of different search boxes.
  const searchId = useMemo(
    () => getUuid(`${customerId}-${corpusId}-${apiKey}`),
    [customerId, corpusId, apiKey]
  );

  const { getPreviousSearches, addPreviousSearch } = useSearchHistory(
    searchId,
    historySize
  );

  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(
    null
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const selectedResultRef = useRef<HTMLDivElement | null>(null);
  const queryRef = useRef<string>("");
  const searchCount = useRef<number>(0);
  const { fetchSearchResults, isLoading } = useSearch(
    customerId,
    corpusId,
    apiKey,
    apiUrl
  );

  const sendSearchQuery = async (query: string) => {
    if (query.length === 0) {
      return;
    }

    const searchId = ++searchCount.current;

    addPreviousSearch(query);

    const results = await fetchSearchResults(query);

    if (searchId === searchCount.current) {
      setSearchResults(results);
      setSelectedResultIndex(null);
      selectedResultRef.current = null;
    }
  };

  // A debounced version of the above, for integration into key handling.
  const debouncedSendSearchQuery = debounce(
    (query: string) => sendSearchQuery(query),
    500
  );

  const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const currentQuery = evt.target.value;
    queryRef.current = currentQuery;

    if (currentQuery.length === 0) {
      resetResults();
    }

    debouncedSendSearchQuery(currentQuery);
  };

  const onKeyDown = useCallback(
    (evt: ReactKeyboardEvent) => {
      const key = evt.key;

      if (key === "Enter") {
        evt.preventDefault();

        if (selectedResultIndex !== null) {
          window.open(searchResults[selectedResultIndex].url, "_self");
        } else {
          sendSearchQuery(queryRef.current);
        }
      }

      if (searchResults.length === 0) {
        return;
      }

      if (key === "ArrowDown") {
        setSelectedResultIndex((prevValue) => {
          return prevValue === null || prevValue === searchResults.length - 1
            ? 0
            : prevValue + 1;
        });
      }

      if (key === "ArrowUp") {
        setSelectedResultIndex((prevValue) => {
          return prevValue === null || prevValue === 0
            ? searchResults.length - 1
            : prevValue - 1;
        });
      }
    },
    [searchResults, selectedResultIndex]
  );

  const resetResults = () => {
    setSearchResults([]);
    setSelectedResultIndex(null);
    selectedResultRef.current = null;
  };

  const closeModalAndResetResults = () => {
    setIsOpen(false);
    resetResults();
  };

  const resultsList =
    searchResults.length === 0
      ? null
      : searchResults.map((searchResult, index) => {
          const {
            snippet: { pre, text, post },
          } = searchResult;

          return (
            <div
              ref={
                selectedResultIndex === index ? selectedResultRef : undefined
              }
              key={`${pre}${text}${post}`}
            >
              <SearchResult
                searchResult={searchResult}
                isSelected={selectedResultIndex === index}
              />
            </div>
          );
        });

  useEffect(() => {
    if (selectedResultRef.current) {
      selectedResultRef.current.scrollIntoView({
        behavior: "instant",
        block: "nearest",
      });
    }
  }, [selectedResultRef.current]);

  useEffect(() => {
    const openSearchOnKeyStroke = (e: KeyboardEvent) => {
      if (e.key === "k" && e.ctrlKey) {
        setIsOpen(true);
      }
    };

    document.addEventListener("keyup", openSearchOnKeyStroke);

    return () => {
      document.removeEventListener("keyup", openSearchOnKeyStroke);
    };
  }, []);

  return (
    <BrowserRouter>
      <div ref={buttonRef}>
        <button className="searchButton" onClick={() => setIsOpen(true)}>
          <VuiFlexContainer
            alignItems="center"
            spacing="s"
            justifyContent="spaceBetween"
            className="searchButton__inner"
          >
            <VuiFlexItem>
              <VuiFlexContainer alignItems="center" spacing="xxs">
                <VuiFlexItem>
                  <VuiIcon>
                    <BiSearch />
                  </VuiIcon>
                </VuiFlexItem>

                <VuiFlexItem>
                  <VuiText>
                    <p>Search</p>
                  </VuiText>
                </VuiFlexItem>
              </VuiFlexContainer>
            </VuiFlexItem>

            <VuiFlexItem>
              <VuiText>
                <p>
                  <VuiTextColor color="subdued">Ctrl+K</VuiTextColor>
                </p>
              </VuiText>
            </VuiFlexItem>
          </VuiFlexContainer>
        </button>
      </div>

      <SearchModal
        isLoading={isLoading}
        onChange={onChange}
        onKeyDown={onKeyDown}
        isOpen={isOpen}
        resultsList={resultsList}
        onClose={closeModalAndResetResults}
      />
    </BrowserRouter>
  );
};
