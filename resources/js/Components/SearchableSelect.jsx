import { useState, useEffect, useRef } from 'react';

/**
 * SearchableSelect
 *
 * Props:
 *  - id          {string}   — html id for the hidden input
 *  - value       {string}   — currently selected value (the option's value)
 *  - onChange    {fn}       — called with the selected value string
 *  - options     {Array}    — [{ value, label }]
 *  - placeholder {string}   — placeholder text
 *  - error       {string}   — error message to display below
 *  - disabled    {bool}
 */
export default function SearchableSelect({
    id,
    value,
    onChange,
    options = [],
    placeholder = 'Search or select…',
    error,
    disabled = false,
}) {
    const [query, setQuery]       = useState('');
    const [open, setOpen]         = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const containerRef            = useRef(null);
    const inputRef                = useRef(null);
    const listRef                 = useRef(null);

    // Resolve current label from value
    const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? '';

    // Filtered options based on search query
    const filtered = query.trim()
        ? options.filter((o) =>
              o.label.toLowerCase().includes(query.toLowerCase())
          )
        : options;

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
                setHighlighted(-1);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlighted >= 0 && listRef.current) {
            const item = listRef.current.children[highlighted];
            item?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlighted]);

    const handleInputClick = () => {
        if (disabled) return;
        setOpen(true);
        setQuery('');
        setHighlighted(-1);
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setOpen(true);
        setHighlighted(-1);
    };

    const handleSelect = (option) => {
        onChange(String(option.value));
        setQuery('');
        setOpen(false);
        setHighlighted(-1);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setQuery('');
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!open) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                setOpen(true);
                setHighlighted(0);
                e.preventDefault();
            }
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
                e.preventDefault();
                break;
            case 'ArrowUp':
                setHighlighted((h) => Math.max(h - 1, 0));
                e.preventDefault();
                break;
            case 'Enter':
                if (highlighted >= 0 && filtered[highlighted]) {
                    handleSelect(filtered[highlighted]);
                }
                e.preventDefault();
                break;
            case 'Escape':
                setOpen(false);
                setQuery('');
                setHighlighted(-1);
                break;
            default:
                break;
        }
    };

    const displayValue = open ? query : selectedLabel;

    return (
        <div ref={containerRef} className="relative">
            {/* Hidden input carries the actual value for form submission */}
            <input type="hidden" id={id} name={id} value={value} />

            {/* Visible search input */}
            <div
                className={`flex items-center mt-1 w-full rounded-md border shadow-sm px-2 py-2 cursor-text transition
                    ${error
                        ? 'border-red-300 focus-within:ring-1 focus-within:ring-red-400 focus-within:border-red-400'
                        : 'border-gray-300 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500'}
                    ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white'}`}
                onClick={() => !disabled && inputRef.current?.focus()}
            >
                {/* Search icon */}
                <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>

                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 min-w-0 leading-tight"
                    placeholder={open ? 'Type to search…' : (selectedLabel || placeholder)}
                    value={displayValue}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    autoComplete="off"
                />

                {/* Clear button */}
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="ml-1 text-gray-400 hover:text-gray-600 shrink-0"
                        tabIndex={-1}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Chevron */}
                <svg
                    className={`w-4 h-4 ml-1 text-gray-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown list */}
            {open && (
                <ul
                    ref={listRef}
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-auto text-sm divide-y divide-gray-100"
                >
                    {filtered.length === 0 ? (
                        <li className="px-4 py-3 text-gray-400 italic text-center">No results found.</li>
                    ) : (
                        filtered.map((option, idx) => (
                            <li
                                key={option.value}
                                className={`px-4 py-2.5 cursor-pointer select-none transition-colors
                                    ${String(option.value) === String(value)
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'}
                                    ${highlighted === idx && String(option.value) !== String(value)
                                        ? 'bg-gray-100'
                                        : ''}`}
                                onMouseDown={() => handleSelect(option)}
                                onMouseEnter={() => setHighlighted(idx)}
                            >
                                {option.label}
                            </li>
                        ))
                    )}
                </ul>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
