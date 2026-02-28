import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Save, Trash2, Plus } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { parseTrack } from '@/lib/gpx';

interface Expedition {
  id?: number;
  type: 'upcoming' | 'past';
  name: string;
  date: string;
  location: string;
  elevation: string;
  image: string;
  description: string;
  route_data: [number, number][];
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const { logout } = useAdmin();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Expedition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchExpeditions();
  }, []);

  const fetchExpeditions = async () => {
    try {
      const res = await fetch('/api/expeditions');
      const data = await res.json();
      setExpeditions(data);
    } catch (error) {
      console.error('Failed to fetch expeditions', error);
    }
  };

  const handleEdit = (expedition: Expedition) => {
    setEditingId(expedition.id!);
    setFormData({ ...expedition });
  };

  const handleCreate = () => {
    setEditingId(-1); // -1 indicates new
    setFormData({
      type: 'past',
      name: '',
      date: '',
      location: '',
      elevation: '',
      image: '',
      description: '',
      route_data: []
    });
  };

  const handleSave = async () => {
    if (!formData) return;

    const token = localStorage.getItem('admin_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      if (editingId === -1) {
        await fetch('/api/expeditions', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`/api/expeditions/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });
      }
      setEditingId(null);
      setFormData(null);
      fetchExpeditions();
    } catch (error) {
      console.error('Failed to save', error);
      alert('Failed to save changes');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`/api/expeditions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchExpeditions();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData) return;

    try {
      const coordinates = await parseTrack(file);
      setFormData({ ...formData, route_data: coordinates });
    } catch (error) {
      alert('Invalid GPX/KML file');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-950">
          <h2 className="font-display text-xl font-bold text-white">Mission Control</h2>
          <div className="flex gap-4">
            <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest">
              Logout
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {editingId !== null && formData ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  {editingId === -1 ? 'New Expedition' : 'Edit Expedition'}
                </h3>
                <button onClick={() => setEditingId(null)} className="text-zinc-400 hover:text-white text-sm">Cancel</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase">Name</label>
                  <input 
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase">Type</label>
                  <select 
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as 'upcoming' | 'past'})}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase">Date</label>
                  <input 
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase">Location</label>
                  <input 
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase">Elevation</label>
                  <input 
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                    value={formData.elevation}
                    onChange={e => setFormData({...formData, elevation: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase">Image URL</label>
                  <input 
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase">Description</label>
                <textarea 
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-32"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase">Route Data (GPX/KML)</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-sm"
                  >
                    <Upload size={16} />
                    Upload Track File
                  </button>
                  <span className="text-zinc-500 text-sm">
                    {formData.route_data.length > 0 ? `${formData.route_data.length} points loaded` : 'No route data'}
                  </span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".gpx,.kml" 
                    className="hidden" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors"
                >
                  <Save size={18} />
                  Save Expedition
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button 
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-zinc-200 transition-colors"
                >
                  <Plus size={16} />
                  New Expedition
                </button>
              </div>

              <div className="grid gap-4">
                {expeditions.map(exp => (
                  <div key={exp.id} className="bg-black border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${exp.type === 'upcoming' ? 'bg-purple-500' : 'bg-zinc-500'}`} />
                      <div>
                        <h4 className="font-bold text-white">{exp.name}</h4>
                        <p className="text-zinc-500 text-xs">{exp.date} • {exp.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(exp)}
                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(exp.id!)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
