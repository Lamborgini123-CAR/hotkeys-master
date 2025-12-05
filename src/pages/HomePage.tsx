import { useState, useEffect } from 'react';
import { Search, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

interface Program {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_popular: boolean;
  category: Category;
  isFavorite?: boolean;
}

interface HomePageProps {
  onSelectProgram: (programId: string) => void;
}

export function HomePage({ onSelectProgram }: HomePageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
    loadPrograms();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterPrograms();
  }, [searchQuery, selectedCategory, programs, favorites]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) setCategories(data);
  };

  const loadPrograms = async () => {
    const { data } = await supabase
      .from('programs')
      .select('*, category:categories(*)');

    if (data) {
      setPrograms(data as unknown as Program[]);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('program_id')
      .eq('user_id', user.id);

    if (data) {
      setFavorites(new Set(data.map(f => f.program_id)));
    }
  };

  const toggleFavorite = async (programId: string) => {
    if (!user) return;

    if (favorites.has(programId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('program_id', programId);

      setFavorites(prev => {
        const next = new Set(prev);
        next.delete(programId);
        return next;
      });
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, program_id: programId });

      setFavorites(prev => new Set([...prev, programId]));
    }
  };

  const filterPrograms = () => {
    let filtered = programs;

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category.id === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    setFilteredPrograms(filtered);
  };

  const popularPrograms = programs.filter(p => p.is_popular);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Справочник горячих клавиш
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Найдите все необходимые сочетания клавиш для вашей любимой программы и повысьте свою продуктивность
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск программы или функции..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Быстрый доступ
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Популярные категории программ для быстрой навигации и поиска нужных горячих клавиш
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                style={{
                  borderColor: selectedCategory === category.id ? category.color : undefined
                }}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {popularPrograms.length > 0 && !searchQuery && !selectedCategory && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Популярные программы
            </h2>
            <p className="text-gray-600 mb-8">
              Самые популярные и часто используемые программы с горячими клавишами для ежедневной работы
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularPrograms.map((program) => (
                <div
                  key={program.id}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelectProgram(program.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">{program.icon}</div>
                    {user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(program.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Heart
                          size={20}
                          className={favorites.has(program.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                        />
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {program.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {program.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {program.category.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(searchQuery || selectedCategory) && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory
                  ? categories.find(c => c.id === selectedCategory)?.name
                  : 'Результаты поиска'}
              </h2>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Сбросить фильтры
              </button>
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Программы не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onSelectProgram(program.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-4xl">{program.icon}</div>
                      {user && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(program.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Heart
                            size={20}
                            className={favorites.has(program.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                          />
                        </button>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {program.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {program.description}
                    </p>
                    <span className="text-xs text-gray-500">
                      {program.category.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
