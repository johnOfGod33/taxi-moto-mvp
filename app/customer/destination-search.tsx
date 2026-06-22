"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/components/ui/combobox";
import { searchAddress, type AddressResult } from "@/lib/geo";

export function DestinationSearch({
  onSelect,
  placeholder = "Où allez-vous ?",
  ariaLabel = "Rechercher une destination",
  initialQuery,
  autoFocus = false,
}: {
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  ariaLabel?: string;
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) return;

    let cancelled = false;

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      const found = await searchAddress(query);
      if (!cancelled) {
        setResults(found);
        setIsSearching(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const visibleResults = query.trim().length < 3 ? [] : results;

  return (
    <Combobox<AddressResult>
      items={visibleResults}
      inputValue={query}
      onInputValueChange={setQuery}
      filter={null}
      itemToStringLabel={(item) => item.label}
      isItemEqualToValue={(a, b) => a.label === b.label}
      onValueChange={(value) => {
        if (value) onSelect(value);
      }}
    >
      <ComboboxInput
        aria-label={ariaLabel}
        placeholder={placeholder}
        showClear
        autoFocus={autoFocus}
        startAddon={<SearchIcon aria-hidden="true" />}
        size="lg"
        className="rounded-full bg-popover shadow-[0_8px_24px_oklch(0.17_0.01_90_/_0.16)]"
      />
      <ComboboxPopup>
        <ComboboxEmpty>
          {isSearching ? "Recherche…" : "Aucun résultat."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: AddressResult) => (
            <ComboboxItem key={item.label} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}
