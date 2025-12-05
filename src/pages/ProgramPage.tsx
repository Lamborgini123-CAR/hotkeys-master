import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Shortcut {
  id: string;
  name: string;
  keys: string;
  description: string;
}

interface Program {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: {
    name: string;
    color: string;
  };
}

interface ProgramPageProps {
  programId: string;
  onBack: () => void;
}

export function ProgramPage({ programId, onBack }: ProgramPageProps) {
  const [program, setProgram] = useState<Program | null>(null);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [filteredShortcuts, setFilteredShortcuts] = useState<Shortcut[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadProgram();
    loadShortcuts();
    if (user) {
      checkFavorite();
    }
  }, [programId, user]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredShortcuts(
        shortcuts.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.keys.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredShortcuts(shortcuts);
    }
  }, [searchQuery, shortcuts]);

  const loadProgram = async () => {
    const { data } = await supabase
      .from('programs')
      .select('*, category:categories(name, color)')
      .eq('id', programId)
      .maybeSingle();

    if (data) {
      setProgram(data as unknown as Program);
    }
  };

  const loadShortcuts = async () => {
    const { data } = await supabase
      .from('shortcuts')
      .select('*')
      .eq('program_id', programId)
      .order('name');

    if (data) {
      setShortcuts(data);
      setFilteredShortcuts(data);
    }
  };

  const checkFavorite = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('program_id', programId);
      setIsFavorite(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, program_id: programId });
      setIsFavorite(true);
    }
  };

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Назад к программам
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{program.icon}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {program.name}
                </h1>
                <p className="text-gray-600 mb-2">{program.description}</p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: program.category.color }}
                >
                  {program.category.name}
                </span>
              </div>
            </div>

            {user && (
              <button
                onClick={toggleFavorite}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Heart
                  size={24}
                  className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск горячей клавиши..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Команда
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Клавиши
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Описание
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredShortcuts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-600">
                      {searchQuery ? 'Горячие клавиши не найдены' : 'Нет доступных горячих клавиш'}
                    </td>
                  </tr>
                ) : (
                  filteredShortcuts.map((shortcut) => (
                    <tr key={shortcut.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{shortcut.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm font-semibold text-gray-800 shadow-sm">
                          {shortcut.keys}
                        </kbd>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {shortcut.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredShortcuts.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Показано {filteredShortcuts.length} из {shortcuts.length} горячих клавиш
          </div>
        )}
      </div>
    </div>
  );
}
