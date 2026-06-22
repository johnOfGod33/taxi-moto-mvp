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
}: {
  onSelect: (result: AddressResult) => void;
}) {
  const [query, setQuery] = useState("");
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
        aria-label="Rechercher une destination"
        placeholder="Où allez-vous ?"
        showClear
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
