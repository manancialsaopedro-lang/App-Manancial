import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { createProduct, listProducts } from '../../lib/api/products';

type WizardStep = 1 | 2 | 3 | 4;

const KEYWORD_CATEGORY_MAP: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['refri', 'coca', 'guarana', 'suco', 'agua', 'energ'], category: 'Bebidas' },
  { keywords: ['salgad', 'pastel', 'coxinha', 'esfiha'], category: 'Salgados' },
  { keywords: ['doc', 'chocolate', 'brigadeiro', 'bala', 'paçoca', 'pacoca'], category: 'Doces' },
  { keywords: ['combo', 'kit'], category: 'Combos' },
  { keywords: ['hamburg', 'hot dog', 'lanche', 'sandu'], category: 'Lanches' },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const OrgStockQuickWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [sellPrice, setSellPrice] = useState<string>('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState<string>('0');
  const [minStock, setMinStock] = useState<string>('5');

  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [categoryTouched, setCategoryTouched] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const products = await listProducts();
      const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
      setExistingCategories(unique);
    } catch (error) {
      console.error('Erro ao carregar categorias para wizard:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const suggestedCategories = useMemo(() => {
    const result: string[] = [];
    const normalizedName = normalize(name);

    for (const item of KEYWORD_CATEGORY_MAP) {
      if (item.keywords.some(k => normalizedName.includes(normalize(k)))) {
        result.push(item.category);
      }
    }

    for (const c of existingCategories) {
      if (result.includes(c)) continue;
      if (!normalizedName) break;
      if (normalize(c).includes(normalizedName) || normalizedName.includes(normalize(c))) {
        result.push(c);
      }
    }

    if (result.length === 0 && existingCategories.length > 0) {
      result.push(...existingCategories.slice(0, 4));
    }

    if (result.length === 0) result.push('Geral');
    return result.slice(0, 6);
  }, [name, existingCategories]);

  useEffect(() => {
    if (categoryTouched) return;
    if (suggestedCategories.length === 0) return;
    setCategory(suggestedCategories[0]);
  }, [suggestedCategories, categoryTouched]);

  const parseMoney = (value: string) => {
    const normalized = value.replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const parseInteger = (value: string, fallback: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.floor(parsed));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!name.trim()) return alert('Informe o nome do produto.');
      setStep(2);
      return;
    }
    if (step === 2) {
      const cost = parseMoney(costPrice || '0');
      const sell = parseMoney(sellPrice);
      if (!Number.isFinite(cost) || cost < 0) return alert('Informe um preço de custo válido.');
      if (!Number.isFinite(sell) || sell <= 0) return alert('Informe um preço de venda válido.');
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!category.trim()) return alert('Informe a categoria.');
      setStep(4);
    }
  };

  const prevStep = () => {
    if (step === 1) {
      navigate('/org/canteen?tab=stock');
      return;
    }
    setStep((step - 1) as WizardStep);
  };

  const saveProduct = async () => {
    const productName = name.trim();
    const productCategory = category.trim() || 'Geral';
    const parsedCost = parseMoney(costPrice || '0');
    const parsedSell = parseMoney(sellPrice);
    const parsedStock = parseInteger(stock, 0);
    const parsedMinStock = parseInteger(minStock, 5);

    if (!productName) return alert('Informe o nome do produto.');
    if (!Number.isFinite(parsedCost) || parsedCost < 0) return alert('Preço de custo inválido.');
    if (!Number.isFinite(parsedSell) || parsedSell <= 0) return alert('Preço de venda inválido.');

    setIsSaving(true);
    try {
      await createProduct({
        name: productName,
        costPrice: parsedCost,
        sellPrice: parsedSell,
        stock: parsedStock,
        minStock: parsedMinStock,
        category: productCategory,
      });
      navigate('/org/canteen?tab=stock');
    } catch (error) {
      console.error('Erro ao cadastrar produto pelo wizard:', error);
      alert('Nao foi possivel cadastrar o produto.');
    } finally {
      setIsSaving(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevStep} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold">
            <ArrowLeft size={18} /> Voltar
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Cadastro Rápido</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Novo Produto</h1>
        <p className="text-gray-500 font-medium">Wizard guiado para cadastrar estoque em poucos passos.</p>
        <div className="mt-6">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-gray-400">Etapa {step} de 4</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        {step === 1 && (
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-gray-400">Nome do Produto</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex.: Refrigerante Lata 350ml"
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400">Preço de Custo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="0,00"
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400">Preço de Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                value={sellPrice}
                onChange={e => setSellPrice(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="0,00"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400">Categoria</label>
              <input
                value={category}
                onChange={e => {
                  setCategoryTouched(true);
                  setCategory(e.target.value);
                }}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Digite ou selecione uma sugestão"
                autoFocus
              />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                <Sparkles size={14} /> Sugestões
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedCategories.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setCategoryTouched(true);
                      setCategory(suggestion);
                    }}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      category === suggestion
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400">Estoque Inicial</label>
              <input
                type="number"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400">Estoque Mínimo</label>
              <input
                type="number"
                value={minStock}
                onChange={e => setMinStock(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="md:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 mb-2">Resumo</p>
              <p className="font-bold text-gray-900">{name || '-'}</p>
              <p className="text-sm text-gray-500">Categoria: {category || 'Geral'}</p>
              <p className="text-sm text-gray-500">Custo: R$ {(parseMoney(costPrice || '0') || 0).toFixed(2)} | Venda: R$ {(parseMoney(sellPrice || '0') || 0).toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={prevStep} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-black hover:bg-gray-200 transition-colors">
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>
          {step < 4 && (
            <button onClick={nextStep} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors">
              Próximo
            </button>
          )}
          {step === 4 && (
            <button
              onClick={saveProduct}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={18} />
                {isSaving ? 'Salvando...' : 'Cadastrar Produto'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
