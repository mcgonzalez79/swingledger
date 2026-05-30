import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, Trash2, Clock, Info } from 'lucide-react';
import { supabase } from '../supabase';
import { useAchievements } from '../context/AchievementContext';

export default function UploadModal({ isOpen, onClose, onDataChanged }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const fileInputRef = useRef(null);
  const { triggerEvaluation } = useAchievements();

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shots')
        .select('id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const grouped = data.reduce((acc, shot) => {
        const d = new Date(shot.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
        
        if (!acc[key]) {
          acc[key] = {
            displayDate: d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
            ids: [],
            count: 0
          };
        }
        acc[key].ids.push(shot.id);
        acc[key].count++;
        return acc;
      }, {});

      setHistory(Object.values(grouped));
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteSession = async (idsToDelete) => {
    if (!window.confirm("Are you sure you want to delete this imported session?")) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      setHistory(prevHistory => prevHistory.filter(session => session.ids[0] !== idsToDelete[0]));

      const chunkSize = 50;
      for (let i = 0; i < idsToDelete.length; i += chunkSize) {
        const chunk = idsToDelete.slice(i, i + chunkSize);
        const { error } = await supabase.from('shots').delete().in('id', chunk);
        if (error) throw error;
      }
      
      await fetchHistory();
      onDataChanged();
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 2000);
      
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete the session. Please try again.");
      fetchHistory(); 
    } finally {
      setIsUploading(false);
    }
  };

  const parseSkyTrakData = (csvText) => {
    const lines = csvText.split('\n');
    let currentClub = 'Unknown';
    const parsedShots = [];
    
    let sessionDate = new Date().toISOString(); 
    const dateMatch = csvText.match(/(\d{1,2}\/\d{1,2}\/\d{4}(?:\s+\d{1,2}:\d{2}\s+[AP]M)?)/i);
    if (dateMatch) {
      sessionDate = new Date(dateMatch[0]).toISOString();
    }

    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('SHOT') && lines[i].includes('CARRY')) {
        headerIndex = i;
        break;
      }
    }
    
    if (headerIndex === -1) throw new Error("Invalid format: Could not find SkyTrak headers.");
    
    const headers = lines[headerIndex].split(',').map(h => h.trim().toUpperCase());
    
    const carryIdx = headers.indexOf('CARRY');
    const totalIdx = headers.indexOf('TOTAL');
    const offlineIdx = headers.indexOf('OFFLINE');
    const ballSpeedIdx = headers.indexOf('BALL SPEED');
    const clubSpeedIdx = headers.indexOf('CLUB SPEED');
    const smashIdx = headers.indexOf('SMASH');
    
    const pathIdx = headers.findIndex(h => h.includes('PATH'));
    const faceIdx = headers.findIndex(h => h.includes('FACE'));
    
    // Removed AoA, explicitly looking for 'BACK' for Backspin
    const spinAxisIdx = headers.findIndex(h => h.includes('SPIN AXIS') || h === 'AXIS');
    const backspinIdx = headers.findIndex(h => h === 'BACK' || h.includes('BACKSPIN') || h.includes('BACK SPIN') || h === 'SPIN');
    const launchIdx = headers.findIndex(h => h.includes('LAUNCH') || h === 'VLA');
    const apexIdx = headers.findIndex(h => h.includes('APEX') || h === 'HEIGHT');

    const parseMetric = (val) => (val && val.trim() !== '' && !isNaN(val)) ? Number(val) : null;
    
    for (let i = headerIndex + 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(',').map(c => c.trim());
      const firstCol = cols[0];
      if (!firstCol) continue;
      
      if (isNaN(firstCol) && firstCol !== 'AVG' && firstCol !== 'SHOT') {
        currentClub = firstCol.replace(/Â/g, '').trim();
        continue;
      }
      
      if (!isNaN(firstCol) && Number(firstCol) > 0) {
        parsedShots.push({
          club: currentClub,
          carry: Number(cols[carryIdx]) || 0,
          total: Number(cols[totalIdx]) || Number(cols[carryIdx]) || 0,
          offline: Number(cols[offlineIdx]) || 0,
          ball_speed: Number(cols[ballSpeedIdx]) || null,
          club_speed: Number(cols[clubSpeedIdx]) || null,
          smash_factor: Number(cols[smashIdx]) || null,
          
          path: pathIdx !== -1 ? parseMetric(cols[pathIdx]) : null,
          ftt: faceIdx !== -1 ? parseMetric(cols[faceIdx]) : null,
          spin_axis: spinAxisIdx !== -1 ? parseMetric(cols[spinAxisIdx]) : null,
          backspin: backspinIdx !== -1 ? parseMetric(cols[backspinIdx]) : null,
          launch_angle: launchIdx !== -1 ? parseMetric(cols[launchIdx]) : null,
          apex: apexIdx !== -1 ? parseMetric(cols[apexIdx]) : null,

          created_at: sessionDate
        });
      }
    }
    return parsedShots;
  };

  const removeOutliers = (shots) => {
    const groupedByClub = {};
    const cleanShots = [];

    shots.forEach(shot => {
      if (!groupedByClub[shot.club]) groupedByClub[shot.club] = [];
      groupedByClub[shot.club].push(shot);
    });

    Object.keys(groupedByClub).forEach(club => {
      const clubShots = groupedByClub[club];

      if (clubShots.length < 5) {
        cleanShots.push(...clubShots);
        return;
      }

      const sortedCarries = [...clubShots].map(s => s.carry).sort((a, b) => a - b);
      const q1 = sortedCarries[Math.floor(sortedCarries.length * 0.25)];
      const q3 = sortedCarries[Math.floor(sortedCarries.length * 0.75)];
      const iqr = q3 - q1;

      const lowerBound = q1 - (2.0 * iqr);
      const upperBound = q3 + (2.0 * iqr);

      const filtered = clubShots.filter(shot => shot.carry >= lowerBound && shot.carry <= upperBound);
      cleanShots.push(...filtered);
    });

    return cleanShots;
  };

  const processFile = (file) => {
    if (!file) return;
    setError(null);
    setSuccess(false);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsedShots = parseSkyTrakData(e.target.result);
        if (parsedShots.length === 0) throw new Error("No valid shots found in the file.");

        const shotsToUpload = removeOutliers(parsedShots);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const shotsWithUser = shotsToUpload.map(shot => ({ ...shot, user_id: user?.id }));

        const { error: dbError } = await supabase.from('shots').insert(shotsWithUser);
        if (dbError) throw dbError;

        setSuccess(true);
        fetchHistory(); 
        
        triggerEvaluation(shotsWithUser, []);

        setTimeout(() => {
          onDataChanged();
          closeModal();
        }, 1500);

      } catch (err) {
        setError(err.message || "Failed to process the CSV file.");
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      setError("Error reading the file.");
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'text/csv' || file?.name.endsWith('.csv')) processFile(file);
    else setError("Please upload a valid CSV file.");
  };

  const closeModal = () => {
    setError(null);
    setSuccess(false);
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Import SkyTrak Data</h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <p className="text-lg font-bold">Upload Successful!</p>
            </div>
          ) : (
            <>
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0])} />
                <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  {isUploading ? 'Processing File...' : 'Click to upload or drag and drop'}
                </h3>
              </div>

              <div className="mt-4 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg flex items-start gap-3 text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>Smart Import:</strong> Our system automatically detects and removes simulator anomalies (like ghost swings and extreme misreads) before saving, keeping your club averages perfectly accurate.
                </p>
              </div>
            </>
          )}

          <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Recent Uploads</h3>
            {loadingHistory ? (
              <p className="text-sm text-slate-400">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-400">No recent uploads found.</p>
            ) : (
              <div className="space-y-2">
                {history.map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{session.displayDate}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{session.count} shots imported</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteSession(session.ids)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}