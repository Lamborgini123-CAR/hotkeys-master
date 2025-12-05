import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  category_id: string;
  name: string;
  description: string;
  icon: string;
  is_popular: boolean;
}

interface Shortcut {
  id: string;
  program_id: string;
  name: string;
  keys: string;
  description: string;
}

type Tab = 'categories' | 'programs' | 'shortcuts';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('programs');
  const [categories, setCategories] = useState<Category[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCategories();
    loadPrograms();
    loadShortcuts();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const loadPrograms = async () => {
    const { data } = await supabase.from('programs').select('*').order('name');
    if (data) setPrograms(data);
  };

  const loadShortcuts = async () => {
    const { data } = await supabase.from('shortcuts').select('*').order('name');
    if (data) setShortcuts(data);
  };

  const handleSaveCategory = async (category: Partial<Category>) => {
    if (category.id) {
      await supabase.from('categories').update(category).eq('id', category.id);
    } else {
      await supabase.from('categories').insert(category);
    }
    loadCategories();
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleSaveProgram = async (program: Partial<Program>) => {
    if (program.id) {
      await supabase.from('programs').update(program).eq('id', program.id);
    } else {
      await supabase.from('programs').insert(program);
    }
    loadPrograms();
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleSaveShortcut = async (shortcut: Partial<Shortcut>) => {
    if (shortcut.id) {
      await supabase.from('shortcuts').update(shortcut).eq('id', shortcut.id);
    } else {
      await supabase.from('shortcuts').insert(shortcut);
    }
    loadShortcuts();
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleDelete = async (table: string, id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
      await supabase.from(table).delete().eq('id', id);
      if (table === 'categories') loadCategories();
      if (table === 'programs') loadPrograms();
      if (table === 'shortcuts') loadShortcuts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Админ панель</h1>
          <p className="text-gray-600">Управление программами, категориями и горячими клавишами</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'categories'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Категории
              </button>
              <button
                onClick={() => setActiveTab('programs')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'programs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Программы
              </button>
              <button
                onClick={() => setActiveTab('shortcuts')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'shortcuts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Горячие клавиши
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'categories' && (
              <CategoriesTab
                categories={categories}
                editingItem={editingItem}
                isCreating={isCreating}
                onEdit={setEditingItem}
                onCreate={() => {
                  setIsCreating(true);
                  setEditingItem({ name: '', slug: '', description: '', icon: '', color: '#3b82f6' });
                }}
                onSave={handleSaveCategory}
                onDelete={(id) => handleDelete('categories', id)}
                onCancel={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }}
              />
            )}

            {activeTab === 'programs' && (
              <ProgramsTab
                programs={programs}
                categories={categories}
                editingItem={editingItem}
                isCreating={isCreating}
                onEdit={setEditingItem}
                onCreate={() => {
                  setIsCreating(true);
                  setEditingItem({ name: '', description: '', icon: '', category_id: categories[0]?.id || '', is_popular: false });
                }}
                onSave={handleSaveProgram}
                onDelete={(id) => handleDelete('programs', id)}
                onCancel={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }}
              />
            )}

            {activeTab === 'shortcuts' && (
              <ShortcutsTab
                shortcuts={shortcuts}
                programs={programs}
                editingItem={editingItem}
                isCreating={isCreating}
                onEdit={setEditingItem}
                onCreate={() => {
                  setIsCreating(true);
                  setEditingItem({ name: '', keys: '', description: '', program_id: programs[0]?.id || '' });
                }}
                onSave={handleSaveShortcut}
                onDelete={(id) => handleDelete('shortcuts', id)}
                onCancel={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesTab({ categories, editingItem, isCreating, onEdit, onCreate, onSave, onDelete, onCancel }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Категории</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Добавить категорию
        </button>
      </div>

      {(isCreating || editingItem) && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Название"
              value={editingItem.name}
              onChange={(e) => onEdit({ ...editingItem, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Слаг (URL)"
              value={editingItem.slug}
              onChange={(e) => onEdit({ ...editingItem, slug: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Иконка (emoji)"
              value={editingItem.icon}
              onChange={(e) => onEdit({ ...editingItem, icon: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="color"
              value={editingItem.color}
              onChange={(e) => onEdit({ ...editingItem, color: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg h-11"
            />
          </div>
          <textarea
            placeholder="Описание"
            value={editingItem.description}
            onChange={(e) => onEdit({ ...editingItem, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => onSave(editingItem)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Сохранить
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <X size={18} />
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((category: Category) => (
          <div key={category.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{category.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(category)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgramsTab({ programs, categories, editingItem, isCreating, onEdit, onCreate, onSave, onDelete, onCancel }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Программы</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Добавить программу
        </button>
      </div>

      {(isCreating || editingItem) && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Название"
              value={editingItem.name}
              onChange={(e) => onEdit({ ...editingItem, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Иконка (emoji)"
              value={editingItem.icon}
              onChange={(e) => onEdit({ ...editingItem, icon: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={editingItem.category_id}
              onChange={(e) => onEdit({ ...editingItem, category_id: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 px-3 py-2">
              <input
                type="checkbox"
                checked={editingItem.is_popular}
                onChange={(e) => onEdit({ ...editingItem, is_popular: e.target.checked })}
                className="rounded"
              />
              <span className="text-gray-700">Популярная программа</span>
            </label>
          </div>
          <textarea
            placeholder="Описание"
            value={editingItem.description}
            onChange={(e) => onEdit({ ...editingItem, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => onSave(editingItem)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Сохранить
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <X size={18} />
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {programs.map((program: Program) => (
          <div key={program.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{program.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{program.name}</h3>
                <p className="text-sm text-gray-600">{program.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(program)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(program.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShortcutsTab({ shortcuts, programs, editingItem, isCreating, onEdit, onCreate, onSave, onDelete, onCancel }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Горячие клавиши</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Добавить горячую клавишу
        </button>
      </div>

      {(isCreating || editingItem) && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={editingItem.program_id}
              onChange={(e) => onEdit({ ...editingItem, program_id: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {programs.map((prog: Program) => (
                <option key={prog.id} value={prog.id}>{prog.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Название команды"
              value={editingItem.name}
              onChange={(e) => onEdit({ ...editingItem, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Клавиши (Ctrl + S)"
              value={editingItem.keys}
              onChange={(e) => onEdit({ ...editingItem, keys: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <textarea
            placeholder="Описание"
            value={editingItem.description}
            onChange={(e) => onEdit({ ...editingItem, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => onSave(editingItem)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Сохранить
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <X size={18} />
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {shortcuts.map((shortcut: Shortcut) => {
          const program = programs.find((p: Program) => p.id === shortcut.program_id);
          return (
            <div key={shortcut.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">{program?.name}</span>
                  <span className="text-gray-300">•</span>
                  <h3 className="font-semibold text-gray-900">{shortcut.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                    {shortcut.keys}
                  </kbd>
                  <span className="text-sm text-gray-600">{shortcut.description}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(shortcut)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete(shortcut.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
