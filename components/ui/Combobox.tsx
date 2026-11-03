import React, { useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  count?: number;
  badgeColor?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  values?: string[];
  onMultiChange?: (values: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value = '',
  onChange,
  values = [],
  onMultiChange,
  multiple = false,
  placeholder = 'Selecionar...',
  searchPlaceholder = 'Filtrar opções...',
  emptyText = 'Nenhuma opção encontrada.',
  className,
  icon,
}) => {
  const [open, setOpen] = useState(false);

  const selectedSingle = options.find((opt) => opt.value === value);

  const handleSelect = (optValue: string) => {
    if (multiple && onMultiChange) {
      if (values.includes(optValue)) {
        onMultiChange(values.filter((v) => v !== optValue));
      } else {
        onMultiChange([...values, optValue]);
      }
    } else if (onChange) {
      onChange(optValue === value ? '' : optValue);
      setOpen(false);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple && onMultiChange) {
      onMultiChange([]);
    } else if (onChange) {
      onChange('');
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-cyan-600/60 hover:bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
            {multiple ? (
              values.length > 0 ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-slate-800 font-bold">{placeholder}:</span>
                  {values.length <= 2 ? (
                    values.map((v) => {
                      const opt = options.find((o) => o.value === v);
                      return (
                        <span
                          key={v}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-50 text-[#082f38] border border-cyan-200/80 text-[10px] font-black"
                        >
                          {opt?.label || v}
                        </span>
                      );
                    })
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#082f38] text-cyan-200 text-[10px] font-black">
                      {values.length} selecionados
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-slate-500">{placeholder}</span>
              )
            ) : selectedSingle ? (
              <span className="text-slate-900 font-bold truncate">{selectedSingle.label}</span>
            ) : (
              <span className="text-slate-500 truncate">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {((multiple && values.length > 0) || (!multiple && value && value !== 'todos')) && (
              <span
                role="button"
                tabIndex={0}
                onClick={clearSelection}
                onKeyDown={(e) => e.key === 'Enter' && clearSelection(e as any)}
                className="p-0.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Limpar filtro"
              >
                <X size={13} />
              </span>
            )}
            <ChevronsUpDown size={14} className="text-slate-400" />
          </div>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-64 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 overflow-hidden animate-in zoom-in-95 fade-in"
        >
          <Command className="w-full">
            <div className="flex items-center border-b border-slate-100 px-3 py-2">
              <Search size={14} className="mr-2 text-slate-400 shrink-0" />
              <Command.Input
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            <Command.List className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
              <Command.Empty className="py-4 text-center text-xs text-slate-400">
                {emptyText}
              </Command.Empty>

              {options.map((option) => {
                const isSelected = multiple
                  ? values.includes(option.value)
                  : value === option.value;

                return (
                  <Command.Item
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer select-none outline-none transition-colors data-[selected=true]:bg-cyan-50/80 data-[selected=true]:text-[#082f38]',
                      isSelected ? 'text-[#082f38] bg-cyan-50/40 font-bold' : 'text-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border transition-colors shrink-0',
                          isSelected
                            ? 'bg-[#082f38] border-[#082f38] text-cyan-300'
                            : 'border-slate-300 bg-white'
                        )}
                      >
                        {isSelected && <Check size={11} className="stroke-[3]" />}
                      </div>
                      <span className="truncate">{option.label}</span>
                    </div>

                    {option.count !== undefined && (
                      <span className="ml-2 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        {option.count}
                      </span>
                    )}
                  </Command.Item>
                );
              })}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
