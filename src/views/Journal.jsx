import React, { useState } from 'react';
import JournalEditor from '../components/JournalEditor';
import JournalList from '../components/JournalList';
import { useJournal } from '../hooks/useJournal';

export default function Journal() {
  const [activeTab, setActiveTab] = useState('list');
  const { entries, loading, insertEntry, updateEntry, deleteEntry } = useJournal();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Triggered when user clicks the "Edit" button on a specific entry card
  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setActiveTab('compose'); // Swap to the compose tab
  };

  // Cancels out of edit mode
  const handleCancelEdit = () => {
    setEditingEntry(null);
    setActiveTab('list');
  };

  const handleSaveEntry = async (data) => {
    setIsSubmitting(true);
    let result;
    
    // Determine if we are updating a past entry or creating a brand new one
    if (editingEntry) {
      result = await updateEntry(editingEntry.id, data);
    } else {
      result = await insertEntry(data);
    }
    
    setIsSubmitting(false);
    
    if (result.success) {
      setEditingEntry(null);
      setTimeout(() => setActiveTab('list'), 500); 
    }
    return result;
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Practice Journal</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Log your swing thoughts, lessons, and range sessions.</p>
      </header>
      
      <div className="flex p-1 mb-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full">
        <button
          onClick={handleCancelEdit} // Clicking back to list cancels edit mode
          className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
            activeTab === 'list' 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          My Journal
        </button>
        <button
          onClick={() => {
            setEditingEntry(null); // Ensure form is blank for a new entry
            setActiveTab('compose');
          }}
          className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
            activeTab === 'compose' 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {editingEntry ? 'Edit Entry' : 'New Entry'}
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'list' ? (
          <JournalList 
            entries={entries} 
            loading={loading} 
            onDelete={deleteEntry} 
            onEdit={handleEditClick}
          />
        ) : (
          <JournalEditor 
            onSubmit={handleSaveEntry} 
            isSubmitting={isSubmitting} 
            initialData={editingEntry}
            onCancel={editingEntry ? handleCancelEdit : null}
          />
        )}
      </div>
    </div>
  );
}