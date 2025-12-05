import { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

interface FavoritesPageProps {
  onSelectProgram: (programId: string) => void;
}

export function FavoritesPage({ onSelectProgram }: FavoritesPageProps) {
  const [favoritePrograms, setFavoritePrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('favorites')
      .select('program_id, programs(*, category:categories(name, color))')
      .eq('user_id', user.id);

    if (data) {
      const programs = data
        .map(f => f.programs)
        .filter(Boolean) as unknown as Program[];
      setFavoritePrograms(programs);
    }
    setLoading(false);
  };

  const removeFavorite = async (programId: string) => {
    if (!user) return;

    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('program_id', programId);

    setFavoritePrograms(prev => prev.filter(p => p.id !== programId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-red-500 fill-red-500" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Избранное</h1>
          </div>
          <p className="text-gray-600">
            Ваши любимые программы для быстрого доступа к горячим клавишам
          </p>
        </div>

        {favoritePrograms.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Heart className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              У вас пока нет избранных программ
            </h3>
            <p className="text-gray-600">
              Добавьте программы в избранное, чтобы быстро находить нужные горячие клавиши
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritePrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="text-4xl cursor-pointer"
                    onClick={() => onSelectProgram(program.id)}
                  >
                    {program.icon}
                  </div>
                  <button
                    onClick={() => removeFavorite(program.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                    title="Удалить из избранного"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => onSelectProgram(program.id)}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {program.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {program.description}
                  </p>
                  <span
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: program.category.color }}
                  >
                    {program.category.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
