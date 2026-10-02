'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Download, 
  Upload, 
  RotateCcw, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';
import { resetDataToDefaults } from '@/lib/data-store';

export default function DatabaseSettingsTab() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = localStorage.getItem('pochampally_supabase_url') || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = localStorage.getItem('pochampally_supabase_key') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      setSupabaseUrl(url);
      setSupabaseKey(key);
      setIsConnected(isSupabaseConfigured());
    }
  }, []);

  const handleSaveCredentials = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pochampally_supabase_url', supabaseUrl.trim());
      localStorage.setItem('pochampally_supabase_key', supabaseKey.trim());
      setIsConnected(isSupabaseConfigured());
      setTestResult('Credentials saved! Reloading Supabase client...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleClearCredentials = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pochampally_supabase_url');
      localStorage.removeItem('pochampally_supabase_key');
      setSupabaseUrl('');
      setSupabaseKey('');
      setIsConnected(false);
      setTestResult('Reset to browser local storage mode.');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const handleTestConnection = async () => {
    setTestResult('Testing connection to Supabase...');
    const client = getSupabaseClient();
    if (!client) {
      setTestResult('Supabase client is not configured. Please enter a valid URL and Anon Key.');
      return;
    }
    try {
      const { data, error } = await client.from('shop_sections').select('count', { count: 'exact', head: true });
      if (error) {
        setTestResult(`Connection response: ${error.message} (Make sure you ran the SQL migration schema in Supabase).`);
      } else {
        setTestResult('✓ Successfully connected to Supabase PostgreSQL database!');
      }
    } catch (e: any) {
      setTestResult(`Connection failed: ${e.message || 'Unknown network error'}`);
    }
  };

  const handleExportBackup = () => {
    if (typeof window === 'undefined') return;
    const backup: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pochampally_')) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pochampally_showroom_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string') {
            localStorage.setItem(k, v);
          } else {
            localStorage.setItem(k, JSON.stringify(v));
          }
        }
        alert('Backup successfully imported! Reloading...');
        window.location.reload();
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all showroom content to authentic Pochampally default seed data? Any unsaved edits will be refreshed.')) {
      resetDataToDefaults();
      alert('Showroom data restored to default seed catalog.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs">
        <h2 className="font-serif text-xl font-bold text-[#1C1917]">
          Supabase Database & Synchronization
        </h2>
        <p className="text-xs text-stone-500">
          Connect your live Supabase cloud database, manage backups, or run in persistent local mode
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7DFD5] shadow-sm flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          <Database className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Database Status: {isConnected ? 'Supabase Connected' : 'Local Storage Mode'}
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isConnected ? 'Active Cloud DB' : 'Offline / Standalone'}
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isConnected
              ? 'Your website is actively connected to Supabase PostgreSQL and Supabase Storage. All collections, sarees, and photos sync with the cloud.'
              : 'The website is running in self-contained browser storage mode with complete CRUD, image compression, and seed data. To connect to your Supabase project, provide your project URL and Anon Key below.'}
          </p>
        </div>
      </div>

      {/* Supabase Credentials Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-stone-900">
          Supabase API Configuration
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Project URL (<code className="text-[#800020]">NEXT_PUBLIC_SUPABASE_URL</code>)
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Anon / Public API Key (<code className="text-[#800020]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono"
            />
          </div>

          {testResult && (
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800">
              {testResult}
            </div>
          )}

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={handleSaveCredentials}
              className="px-5 py-2.5 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#660019] transition-colors shadow"
            >
              Save Credentials & Connect
            </button>

            <button
              onClick={handleTestConnection}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
            >
              Test Supabase Connection
            </button>

            {supabaseUrl && (
              <button
                onClick={handleClearCredentials}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
              >
                Clear Keys
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SQL Migration Schema Guide */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-stone-900">
            Supabase SQL Migration File (`supabase_schema.sql`)
          </h3>
          <span className="text-xs text-stone-500">
            Available in root workspace directory
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          We have generated a ready-to-run PostgreSQL schema file <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono">supabase_schema.sql</code> containing all tables (<code className="font-mono">shop_settings</code>, <code className="font-mono">shop_sections</code>, <code className="font-mono">collections</code>, <code className="font-mono">sarees</code>, <code className="font-mono">process_steps</code>), Row Level Security (RLS) policies, and foreign key relations.
        </p>

        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E7DFD5] text-xs space-y-2 text-stone-700">
          <strong>How to run in Supabase:</strong>
          <ol className="list-decimal pl-5 space-y-1 text-[11px]">
            <li>Open your Supabase dashboard at <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#800020] underline">supabase.com</a></li>
            <li>Navigate to the <strong>SQL Editor</strong> tab on the left sidebar</li>
            <li>Paste the contents of <code className="font-mono">supabase_schema.sql</code> and click <strong>Run</strong></li>
            <li>Create a Storage bucket named <code className="font-mono">saree-images</code> with Public read access</li>
          </ol>
        </div>
      </div>

      {/* Backup & Factory Reset Tools */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-stone-900">
          Catalog Backup & Reset Utilities
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E7DFD5] text-left transition-colors flex flex-col justify-between"
          >
            <Download className="w-5 h-5 text-[#800020] mb-2" />
            <div>
              <span className="block text-xs font-bold text-stone-800">Export Backup JSON</span>
              <span className="block text-[11px] text-stone-500">Download complete catalog</span>
            </div>
          </button>

          <label className="p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E7DFD5] text-left transition-colors flex flex-col justify-between cursor-pointer">
            <Upload className="w-5 h-5 text-emerald-700 mb-2" />
            <div>
              <span className="block text-xs font-bold text-stone-800">Import Backup JSON</span>
              <span className="block text-[11px] text-stone-500">Restore from JSON file</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetDefaults}
            className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left transition-colors flex flex-col justify-between"
          >
            <RotateCcw className="w-5 h-5 text-rose-600 mb-2" />
            <div>
              <span className="block text-xs font-bold text-rose-900">Reset to Defaults</span>
              <span className="block text-[11px] text-rose-600">Restore seed handlooms</span>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}
