import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

const CATEGORIES = ['Lesson', 'Driving Range', 'Short Game', 'Mental', 'Swing Thought'];

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ],
};

export default function JournalEditor({ onSubmit, isSubmitting, initialData = null, onCancel = null }) {
  const [successStatus, setSuccessStatus] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Driving Range',
    content: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ title: '', category: 'Driving Range', content: '' });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cleanContent = formData.content.replace(/<(.|\n)*?>/g, '').trim() === '' ? '' : formData.content;
    
    const result = await onSubmit({ ...formData, content: cleanContent });
    
    if (result && result.success && !initialData) {
      setSuccessStatus(true);
      setTimeout(() => setSuccessStatus(false), 3000);
      setFormData({ title: '', category: 'Driving Range', content: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full pb-8 space-y-6">
      {successStatus && (
        <div className="p-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-center font-bold">
          Journal entry saved successfully!
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        
        <div className="border-b border-slate-200 dark:border-slate-800">
          <input 
            type="text" 
            placeholder="Entry Title" 
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-transparent text-lg md:text-xl font-bold outline-none p-4 md:p-6 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-slate-50 dark:focus:bg-slate-800/50 transition-colors"
          />
        </div>

        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950/50">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  formData.category === cat 
                    ? 'bg-emerald-600 text-white shadow-sm border border-emerald-600' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* THE FIX: Added `!` to force Tailwind to override Quill's stubborn default styles */}
        <div className="
          border-t border-slate-200 dark:border-slate-800
          
          /* Nuke default borders */
          [&_.quill]:!border-none
          [&_.ql-container.ql-snow]:!border-none
          
          /* Toolbar background and borders */
          [&_.ql-toolbar.ql-snow]:!border-none
          [&_.ql-toolbar.ql-snow]:!border-b
          [&_.ql-toolbar.ql-snow]:!border-slate-200
          dark:[&_.ql-toolbar.ql-snow]:!border-slate-800
          [&_.ql-toolbar.ql-snow]:!bg-slate-50
          dark:[&_.ql-toolbar.ql-snow]:!bg-slate-900/50
          
          /* Editor text styling */
          [&_.ql-editor]:min-h-[250px]
          [&_.ql-editor]:text-base
          [&_.ql-editor]:!text-slate-800
          dark:[&_.ql-editor]:!text-slate-200
          
          /* Placeholder styling */
          [&_.ql-editor.ql-blank::before]:!text-slate-400
          dark:[&_.ql-editor.ql-blank::before]:!text-slate-500
          [&_.ql-editor.ql-blank::before]:!font-normal
          [&_.ql-editor.ql-blank::before]:!italic
          
          /* Light Mode Icons */
          [&_.ql-snow_.ql-stroke]:!stroke-slate-500
          [&_.ql-snow_.ql-fill]:!fill-slate-500
          
          /* Dark Mode Icons */
          dark:[&_.ql-snow_.ql-stroke]:!stroke-slate-400
          dark:[&_.ql-snow_.ql-fill]:!fill-slate-400
          
          /* Active / Hover Icons */
          [&_.ql-snow_.ql-active_.ql-stroke]:!stroke-emerald-600
          [&_.ql-snow_.ql-active_.ql-fill]:!fill-emerald-600
          dark:[&_.ql-snow_.ql-active_.ql-stroke]:!stroke-emerald-500
          dark:[&_.ql-snow_.ql-active_.ql-fill]:!fill-emerald-500
          
          [&_button:hover_.ql-stroke]:!stroke-emerald-500
          [&_button:hover_.ql-fill]:!fill-emerald-500
          dark:[&_button:hover_.ql-stroke]:!stroke-emerald-400
          dark:[&_button:hover_.ql-fill]:!fill-emerald-400
        ">
          <ReactQuill 
            theme="snow"
            modules={quillModules}
            value={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            placeholder="What did you work on today?"
          />
        </div>
      </div>

      <div className="flex gap-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 p-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-lg font-bold rounded-lg transition-colors">
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={isSubmitting || !formData.title.trim() || !formData.content}
          className="flex-[2] p-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Journal Entry' : 'Save Journal Entry'}
        </button>
      </div>
    </form>
  );
}