/*
  Search bar.
*/

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchDiseaseSearch, fetchTargetSearch } from '@/lib/api';
import type { SearchResult } from '@/types/tictac';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    className?: string;
    placeholder?: string;
    autoFocus?: boolean;
}

export const SearchBar = ({
    className,
    placeholder = 'Search diseases or gene targets...',
    autoFocus = false,
}: SearchBarProps) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const search = useCallback(async (q: string) => {
        // Asking for more than 2 chars for results
        if (q.length < 2) {
            setResults([]);
            return;
        }

        // API Request
        try {
            const [diseases, targets] = await Promise.all([
                fetchDiseaseSearch(q, 4),
                fetchTargetSearch(q, 4),
            ]);

            const diseaseResults: SearchResult[] = diseases.map((d) => ({
                type: 'disease',
                id: d.doid,
                name: d.disease_name,
                subtitle: d.doid,
            }));

            const geneResults: SearchResult[] = targets.map((t) => ({
                type: 'gene',
                id: t.gene_symbol,
                name: t.gene_symbol,
                subtitle: `${t.uniprot} • ${t.idgtdl}`,
            }));

            setResults([...diseaseResults, ...geneResults]);
            setSelectedIndex(-1);
        } catch {
            setResults([]);
        }
    }, []);

    const handleSelect = useCallback((result: SearchResult) => {
        setQuery('');
        setIsOpen(false);
        setResults([]);

        if (result.type === 'disease') {
            navigate(`/dashboard?disease=${encodeURIComponent(result.id)}`);
        } else {
            navigate(`/dashboard?gene=${encodeURIComponent(result.id)}`);
        }
    }, [navigate]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }, [results, selectedIndex, handleSelect]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void search(query);
        }, 200);
        return () => clearTimeout(timer);
    }, [query, search]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={cn('relative w-full max-w-2xl', className)}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="pl-12 pr-10 h-14 text-lg rounded-xl border-2 border-border/50 bg-card/80 backdrop-blur-sm shadow-lg focus:border-primary/50 transition-all"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border shadow-xl overflow-hidden z-50 animate-fade-in">
                    <div className="py-2">
                        {results.map((result, index) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleSelect(result)}
                                className={cn(
                                    'w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-muted/50 transition-colors',
                                    selectedIndex === index && 'bg-muted/50'
                                )}
                            >
                                <Badge
                                    variant={result.type === 'disease' ? 'default' : 'secondary'}
                                    className="shrink-0"
                                >
                                    {result.type === 'disease' ? 'Disease' : 'Gene'}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{result.name}</div>
                                    <div className="text-sm text-muted-foreground truncate">
                                        {result.subtitle}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isOpen && query.length >= 2 && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border shadow-xl p-4 z-50 animate-fade-in">
                    <p className="text-muted-foreground text-center">
                        No results found for "{query}"
                    </p>
                </div>
            )}
        </div>
    );
};
