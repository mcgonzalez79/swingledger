import React, { useState, useMemo } from 'react';
import { Trash2, FileEdit, X, Search, Pin } from 'lucide-react'; 
import DOMPurify from 'dompurify';

export default function JournalList({ entries, loading, onDelete, onEdit, onTogglePin }) {
  const [showAllModal, setShowAllModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // THE FIX: Sort entries so pinned items always appear at the top
  const sortedEntries = useMemo(() => {
    if (!entries) return [];
    return [...entries].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0; // If both are pinned or unpinned, leave their existing (chronological) order
    });
  }, [entries]);

  if (loading) return <div className="p-4 text-emerald-600 font-medium">Loading journal...</div>;
  if (!sortedEntries || sortedEntries.length === 0) return <div className="p-8 text-center text-slate-500">No entries yet. Start journaling!</div>;

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Lesson': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Driving Range': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Short Game': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Mental': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Swing Thought': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'Notes': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      onDelete(id);
    }
  };

  const handleEditAndClose = (entry) => {
    setShowAllModal(false);
    setSearchQuery(''); 
    onEdit(entry);
  };

  // Limit main view to the 2 most recent/pinned entries
  const recentEntries = sortedEntries.slice(0, 2);

  // Real-time filtering logic
  const filteredEntries = sortedEntries.filter(entry => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const titleMatch = entry.title?.toLowerCase().includes(query);
    const categoryMatch = entry.category?.toLowerCase().includes(query);
    
    // Strips HTML tags from content to search the raw text cleanly
    const rawContent = entry.content ? entry.content.replace(/<[^>]*>?/gm, '').toLowerCase() : '';
    const contentMatch = rawContent.includes(query);
    
    return titleMatch || categoryMatch || contentMatch;
  });

  const renderCard = (entry) => (
    <div key={entry.id} className={`bg-white dark:bg-slate-800 border ${entry.is_pinned ? 'border-amber-400 dark:border-amber-500/50' : 'border-slate-200 dark:border-slate-700'} rounded-xl p-4 md:p-6 shadow-sm relative transition-all hover:shadow-md`}>
      
      {/* THE FIX: Added a visual indicator for pinned cards */}
      {entry.is_pinned && (
        <div className="absolute -top-3 -left-3 bg-amber-400 text-amber-900 p-1.5 rounded-full shadow-sm z-10 border border-amber-300">
          <Pin className="w-4 h-4" fill="currentColor" />
        </div>
      )}

      <div className="flex justify-between items-start mb-4 pr-32">
        <div>
          <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-2 inline-block ${getCategoryBadge(entry.category)}`}>
            {entry.category}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {entry.title}
          </h3>
        </div>
      </div>

      <div className="absolute top-4 md:top-6 right-4 flex gap-2">
        <button 
          onClick={() => onTogglePin && onTogglePin(entry)}
          className={`p-2 rounded-full shadow-sm border transition-colors ${entry.is_pinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' : 'text-slate-400 hover:text-amber-500 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
          title={entry.is_pinned ? "Unpin Entry" : "Pin Entry"}
        >
          <Pin className="w-4 h-4" fill={entry.is_pinned ? "currentColor" : "none"} />
        </button>
        <button 
          onClick={() => onEdit(entry)}
          className="p-2 text-slate-400 hover:text-emerald-500 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
          title="Edit Entry"
        >
          <FileEdit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleDelete(entry.id)}
          className="p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
          title="Delete Entry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div 
        className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words overflow-hidden [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_strong]:font-bold [&_em]:italic"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(entry.content) }} 
      />

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-400 font-medium flex items-center justify-between">
        <span>
          {new Date(entry.created_at).toLocaleDateString(undefined, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </span>
      </div>
    </div>
  );

  const renderListItem = (entry) => (
    <div key={entry.id} className={`flex items-center justify-between p-4 border-b ${entry.is_pinned ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'} transition-colors`}>
      <div className="flex-1 pr-4 cursor-pointer" onClick={() => handleEditAndClose(entry)}>
        <div className="flex items-center gap-3 mb-1">
          {entry.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getCategoryBadge(entry.category)}`}>
            {entry.category}
          </span>
          <span className="text-xs text-slate-500">
             {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">{entry.title}</h4>
      </div>
      
      <div className="flex gap-2 shrink-0">
        <button 
          onClick={() => onTogglePin && onTogglePin(entry)}
          className={`p-2 rounded-full shadow-sm border transition-colors ${entry.is_pinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' : 'text-slate-400 hover:text-amber-500 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}
        >
          <Pin className="w-4 h-4" fill={entry.is_pinned ? "currentColor" : "none"} />
        </button>
        <button 
          onClick={() => handleEditAndClose(entry)}
          className="p-2 text-slate-400 hover:text-emerald-500 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <FileEdit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleDelete(entry.id)}
          className="p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-4 w-full pb-4">
        {recentEntries.map(renderCard)}
      </div>

      {sortedEntries.length > 2 && (
        <button 
          onClick={() => setShowAllModal(true)}
          className="w-full mb-8 py-4 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors border-2 border-slate-200 dark:border-slate-700 border-dashed"
        >
          View All {sortedEntries.length} Past Entries
        </button>
      )}

      {showAllModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 z-10 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">All Journal Entries</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select an entry to view or edit.</p>
              </div>
              <button 
                onClick={() => {
                  setShowAllModal(false);
                  setSearchQuery('');
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search entries by title, category, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 md:p-4 bg-slate-50 dark:bg-slate-950">
              {filteredEntries.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  No entries found matching "{searchQuery}"
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
                  {filteredEntries.map(renderListItem)}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}