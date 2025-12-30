import { useState, useCallback, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrencyStore, currencies, type CurrencyCode } from '@/store/useCurrencyStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
}

export interface FilterState {
  category: string | null;
  conditions: string[];
  priceRange: [number, number];
}

const categories = ['All Categories', 'Phones', 'Laptops', 'Consoles', 'Tablets', 'Cameras', 'Accessories'];

const conditions = [
  { value: 'excellent', label: 'New' },
  { value: 'good', label: 'Like New' },
  { value: 'fair', label: 'Good' },
  { value: 'poor', label: 'Fair' },
];

const pricePresets = [
  { label: '₹500+', value: 500 },
  { label: '₹1K+', value: 1000 },
  { label: '₹3K+', value: 3000 },
  { label: '₹5K+', value: 5000 },
  { label: '₹10K+', value: 10000 },
  { label: '₹15K+', value: 15000 },
];

const MAX_PRICE = 200000;

export const ProductFilters = ({ onFilterChange, filters }: ProductFiltersProps) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { currency, setCurrency, formatPrice } = useCurrencyStore();
  
  // Local state for controlled inputs - synced with filters
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(filters.priceRange);
  const [minInput, setMinInput] = useState(String(filters.priceRange[0]));
  const [maxInput, setMaxInput] = useState(String(filters.priceRange[1]));

  // Sync local state when filters change externally
  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
    setMinInput(String(filters.priceRange[0]));
    setMaxInput(String(filters.priceRange[1]));
  }, [filters.priceRange]);

  const handleConditionToggle = useCallback((condition: string) => {
    const newConditions = filters.conditions?.includes(condition)
      ? filters.conditions.filter(c => c !== condition)
      : [...(filters.conditions || []), condition];
    
    onFilterChange({
      ...filters,
      conditions: newConditions,
    });
  }, [filters, onFilterChange]);

  const handleCategoryChange = useCallback((category: string) => {
    onFilterChange({
      ...filters,
      category: category === 'All Categories' ? null : category,
    });
  }, [filters, onFilterChange]);

  // Handle slider change - update local state immediately, debounce filter update
  const handlePriceRangeChange = useCallback((values: number[]) => {
    const [min, max] = values as [number, number];
    setLocalPriceRange([min, max]);
    setMinInput(String(min));
    setMaxInput(String(max));
  }, []);

  // Commit price range on slider release
  const handlePriceRangeCommit = useCallback((values: number[]) => {
    const [min, max] = values as [number, number];
    onFilterChange({
      ...filters,
      priceRange: [min, max],
    });
  }, [filters, onFilterChange]);

  const handleMinInputChange = useCallback((value: string) => {
    setMinInput(value);
    const num = parseInt(value) || 0;
    if (num >= 0 && num <= localPriceRange[1]) {
      setLocalPriceRange([num, localPriceRange[1]]);
      onFilterChange({
        ...filters,
        priceRange: [num, filters.priceRange[1]],
      });
    }
  }, [filters, localPriceRange, onFilterChange]);

  const handleMaxInputChange = useCallback((value: string) => {
    setMaxInput(value);
    const num = parseInt(value) || MAX_PRICE;
    if (num >= localPriceRange[0] && num <= MAX_PRICE) {
      setLocalPriceRange([localPriceRange[0], num]);
      onFilterChange({
        ...filters,
        priceRange: [filters.priceRange[0], num],
      });
    }
  }, [filters, localPriceRange, onFilterChange]);

  const handlePresetClick = useCallback((minValue: number) => {
    setMinInput(String(minValue));
    setMaxInput(String(MAX_PRICE));
    setLocalPriceRange([minValue, MAX_PRICE]);
    onFilterChange({
      ...filters,
      priceRange: [minValue, MAX_PRICE],
    });
  }, [filters, onFilterChange]);

  const clearFilters = useCallback(() => {
    setMinInput('0');
    setMaxInput(String(MAX_PRICE));
    setLocalPriceRange([0, MAX_PRICE]);
    onFilterChange({
      category: null,
      conditions: [],
      priceRange: [0, MAX_PRICE],
    });
  }, [onFilterChange]);

  const hasActiveFilters = filters.category || (filters.conditions?.length > 0) || 
    filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE;

  const FilterContent = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Filters</h2>

      {/* Condition */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Condition
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {conditions.map((cond) => (
            <label
              key={cond.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.conditions?.includes(cond.value) || false}
                onCheckedChange={() => handleConditionToggle(cond.value)}
                className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {cond.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Price Range
          </h4>
          <Select value={currency.code} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
            <SelectTrigger className="w-[100px] h-8 text-xs bg-muted border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code} className="text-xs">
                  {curr.code} ({curr.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Inputs */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currency.symbol}
            </span>
            <input
              type="number"
              value={minInput}
              onChange={(e) => handleMinInputChange(e.target.value)}
              className="w-full h-12 pl-8 pr-3 rounded-lg bg-muted border-0 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="0"
            />
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currency.symbol}
            </span>
            <input
              type="number"
              value={maxInput}
              onChange={(e) => handleMaxInputChange(e.target.value)}
              className="w-full h-12 pl-8 pr-3 rounded-lg bg-muted border-0 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={String(MAX_PRICE)}
            />
          </div>
        </div>

        {/* Slider - Fixed controlled state */}
        <div className="px-1 mb-2">
          <Slider
            value={localPriceRange}
            min={0}
            max={MAX_PRICE}
            step={100}
            onValueChange={handlePriceRangeChange}
            onValueCommit={handlePriceRangeCommit}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mb-4">
          <span>{currency.symbol}0</span>
          <span>{currency.symbol}{MAX_PRICE.toLocaleString()}</span>
        </div>

        {/* Price Presets */}
        <div className="flex flex-wrap gap-2">
          {pricePresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filters.priceRange[0] === preset.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Category
        </h4>
        <Select 
          value={filters.category || 'All Categories'} 
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full h-12 bg-muted border-0 text-foreground">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="h-4 w-4 rounded-full border-2 border-current" />
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden md:block bg-card rounded-xl border border-border p-5">
        <FilterContent />
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>

        {showMobileFilters && (
          <div className="mt-4 p-5 bg-card rounded-xl border border-border animate-fade-in">
            <FilterContent />
          </div>
        )}
      </div>
    </>
  );
};
