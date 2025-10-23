'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Save, RefreshCw, Shield, Mail, User, Globe, 
  Bell, Lock, Eye, EyeOff, Server, Database, AlertTriangle,
  CheckCircle, XCircle, Info, Moon, Sun, Smartphone, Key,
  Users, Clock, FileText, Download, Upload, Trash2
} from 'lucide-react';

interface SettingsData {
  platform: any;
  admin: any;
  email: any;
  security: any;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('platform');
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section: string, sectionSettings: any) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          section,
          settings: sectionSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    });
  };

  const tabs = [
    { id: 'platform', name: 'Platform', icon: Globe },
    { id: 'admin', name: 'Account', icon: User },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings size={24} className="text-gray-600" />
          <h3 className="text-lg font-bold text-black">Platform Settings</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-cream-200 rounded-lg p-4 h-32 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="bg-white rounded-lg p-6 border border-red-200">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-400 mb-2" size={32} />
          <h3 className="text-lg font-medium text-red-900">Settings Unavailable</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
          >
            <RefreshCw size={14} className="inline mr-1" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={24} className="text-gray-600" />
          <div>
            <h3 className="text-lg font-bold text-white">Platform Settings</h3>
            <p className="text-sm text-gray-300">Configure platform behavior and preferences</p>
          </div>
        </div>
        
        <button
          onClick={fetchSettings}
          className="p-2 hover:bg-cream-300 rounded-lg transition"
          title="Refresh settings"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-white hover:text-gray-300 hover:border-gray-500'
                }`}
              >
                <Icon size={16} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-green-800 rounded-lg p-6 border border-green-700">
        {activeTab === 'platform' && (
          <PlatformSettings 
            settings={settings?.platform || {}}
            onUpdate={(key, value) => updateSetting('platform', key, value)}
            onSave={(sectionSettings) => saveSettings('platform', sectionSettings)}
            saving={saving}
          />
        )}

        {activeTab === 'admin' && (
          <AdminAccountSettings 
            settings={settings?.admin || {}}
            onUpdate={(key, value) => updateSetting('admin', key, value)}
            onSave={(sectionSettings) => saveSettings('admin', sectionSettings)}
            saving={saving}
          />
        )}

        {activeTab === 'email' && (
          <EmailSettings 
            settings={settings?.email || {}}
            onUpdate={(key, value) => updateSetting('email', key, value)}
            onSave={(sectionSettings) => saveSettings('email', sectionSettings)}
            saving={saving}
            showPasswords={showPasswords}
            onTogglePasswords={() => setShowPasswords(!showPasswords)}
          />
        )}

        {activeTab === 'security' && (
          <SecuritySettings 
            settings={settings?.security || {}}
            onUpdate={(key, value) => updateSetting('security', key, value)}
            onSave={(sectionSettings) => saveSettings('security', sectionSettings)}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

// Platform Settings Component
function PlatformSettings({ settings, onUpdate, onSave, saving }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-white">Platform Configuration</h4>
        <button
          onClick={() => onSave(settings)}
          disabled={saving}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:bg-pink-300 text-white rounded-lg transition flex items-center gap-2"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Platform Name
          </label>
          <input
            type="text"
            value={settings.platform_name?.value || ''}
            onChange={(e) => onUpdate('platform_name', e.target.value)}
            className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Women in Design Uganda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Contact Fee (UGX)
          </label>
          <input
            type="number"
            value={settings.contact_fee?.value || ''}
            onChange={(e) => onUpdate('contact_fee', e.target.value)}
            className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="10000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Max Portfolio Items
          </label>
          <input
            type="number"
            value={settings.max_portfolio_items?.value || ''}
            onChange={(e) => onUpdate('max_portfolio_items', e.target.value)}
            className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Max File Size (MB)
          </label>
          <input
            type="number"
            value={Math.round((parseInt(settings.max_file_size?.value || '0') / 1048576) * 100) / 100}
            onChange={(e) => onUpdate('max_file_size', (parseFloat(e.target.value) * 1048576).toString())}
            className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="10"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h5 className="font-medium text-white">Platform Controls</h5>
        
        <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
          <div>
            <h6 className="font-medium text-white">User Registration</h6>
            <p className="text-sm text-gray-300">Allow new users to register on the platform</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.registration_enabled?.value === 'true'}
              onChange={(e) => onUpdate('registration_enabled', e.target.checked.toString())}
              className="sr-only"
            />
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.registration_enabled?.value === 'true' ? 'bg-gray-600' : 'bg-gray-300'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.registration_enabled?.value === 'true' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-800 rounded-lg border border-red-600">
          <div>
            <h6 className="font-medium text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              Maintenance Mode
            </h6>
            <p className="text-sm text-red-200">Temporarily disable platform access for maintenance</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenance_mode?.value === 'true'}
              onChange={(e) => onUpdate('maintenance_mode', e.target.checked.toString())}
              className="sr-only"
            />
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.maintenance_mode?.value === 'true' ? 'bg-red-500' : 'bg-gray-300'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.maintenance_mode?.value === 'true' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

// Admin Account Settings Component
function AdminAccountSettings({ settings, onUpdate, onSave, saving }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-black">Account Settings</h4>
        <button
          onClick={() => onSave(settings)}
          disabled={saving}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:bg-pink-300 text-white rounded-lg transition flex items-center gap-2"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            First Name
          </label>
          <input
            type="text"
            value={settings.firstName || ''}
            onChange={(e) => onUpdate('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={settings.lastName || ''}
            onChange={(e) => onUpdate('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={settings.email || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-400 bg-cream-300 rounded-lg text-black"
          />
          <p className="text-xs text-gray-700 mt-1">Email cannot be changed for admin account</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.phone || ''}
            onChange={(e) => onUpdate('phone', e.target.value)}
            className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="+256 xxx xxx xxx"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone || 'Africa/Kampala'}
            onChange={(e) => onUpdate('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Africa/Kampala">Africa/Kampala (EAT)</option>
            <option value="UTC">UTC</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="America/New_York">America/New_York (EST)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Language
          </label>
          <select
            value={settings.language || 'en'}
            onChange={(e) => onUpdate('language', e.target.value)}
            className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="en">English</option>
            <option value="sw">Swahili</option>
            <option value="lg">Luganda</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h5 className="font-medium text-black">Preferences</h5>
        
        <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
          <div>
            <h6 className="font-medium text-white flex items-center gap-2">
              <Bell size={16} />
              Dashboard Notifications
            </h6>
            <p className="text-sm text-gray-600">Receive notifications in the admin dashboard</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => onUpdate('notifications', e.target.checked)}
              className="sr-only"
            />
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.notifications ? 'bg-gray-600' : 'bg-gray-300'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
          <div>
            <h6 className="font-medium text-white flex items-center gap-2">
              <Mail size={16} />
              Email Notifications
            </h6>
            <p className="text-sm text-gray-600">Receive notifications via email</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => onUpdate('emailNotifications', e.target.checked)}
              className="sr-only"
            />
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.emailNotifications ? 'bg-gray-600' : 'bg-gray-300'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
          <div>
            <h6 className="font-medium text-white flex items-center gap-2">
              {settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              Dashboard Theme
            </h6>
            <p className="text-sm text-gray-600">Choose your preferred dashboard appearance</p>
          </div>
          <select
            value={settings.theme || 'light'}
            onChange={(e) => onUpdate('theme', e.target.value)}
            className="px-3 py-2 border border-gray-300 bg-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Email Settings Component  
function EmailSettings({ settings, onUpdate, onSave, saving, showPasswords, onTogglePasswords }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-black">Email Configuration</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePasswords}
            className="p-2 hover:bg-cream-300 rounded-lg transition"
            title={showPasswords ? 'Hide passwords' : 'Show passwords'}
          >
            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={() => onSave(settings)}
            disabled={saving}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:bg-pink-300 text-white rounded-lg transition flex items-center gap-2"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h5 className="font-medium text-black mb-4">SMTP Configuration</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.smtp_host || ''}
                onChange={(e) => onUpdate('smtp_host', e.target.value)}
                className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtp_port || ''}
                onChange={(e) => onUpdate('smtp_port', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="587"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                SMTP Username
              </label>
              <input
                type={showPasswords ? 'text' : 'email'}
                value={settings.smtp_user || ''}
                onChange={(e) => onUpdate('smtp_user', e.target.value)}
                className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
                <div>
                  <h6 className="font-medium text-black">Secure Connection (SSL/TLS)</h6>
                  <p className="text-sm text-gray-600">Use encrypted connection for email sending</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smtp_secure}
                    onChange={(e) => onUpdate('smtp_secure', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    settings.smtp_secure ? 'bg-gray-600' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.smtp_secure ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-medium text-black mb-4">Email Features</h5>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
              <div>
                <h6 className="font-medium text-black">Welcome Emails</h6>
                <p className="text-sm text-gray-600">Send welcome email to new users</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.welcome_email_enabled}
                  onChange={(e) => onUpdate('welcome_email_enabled', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.welcome_email_enabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.welcome_email_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
              <div>
                <h6 className="font-medium text-black">Notification Emails</h6>
                <p className="text-sm text-gray-600">Send notification emails for platform activities</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notification_email_enabled}
                  onChange={(e) => onUpdate('notification_email_enabled', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.notification_email_enabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.notification_email_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
              <div>
                <h6 className="font-medium text-black">Daily Digest</h6>
                <p className="text-sm text-gray-600">Send daily activity summary to admin</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.daily_digest_enabled}
                  onChange={(e) => onUpdate('daily_digest_enabled', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.daily_digest_enabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.daily_digest_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
              <div>
                <h6 className="font-medium text-black">Weekly Reports</h6>
                <p className="text-sm text-gray-600">Send weekly analytics reports to admin</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weekly_report_enabled}
                  onChange={(e) => onUpdate('weekly_report_enabled', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.weekly_report_enabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.weekly_report_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Settings Component
function SecuritySettings({ settings, onUpdate, onSave, saving }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-black">Security Configuration</h4>
        <button
          onClick={() => onSave(settings)}
          disabled={saving}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:bg-pink-300 text-white rounded-lg transition flex items-center gap-2"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h5 className="font-medium text-black mb-4">Authentication Settings</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={Math.round(settings.session_timeout / 60)}
                onChange={(e) => onUpdate('session_timeout', parseInt(e.target.value) * 60)}
                className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.max_login_attempts || ''}
                onChange={(e) => onUpdate('max_login_attempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Password Expiry (days)
              </label>
              <input
                type="number"
                value={settings.password_expiry_days || ''}
                onChange={(e) => onUpdate('password_expiry_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-blue-600 bg-blue-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="90"
              />
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-medium text-black mb-4">Security Features</h5>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
              <div>
                <h6 className="font-medium text-white flex items-center gap-2">
                  <Smartphone size={16} />
                  Two-Factor Authentication
                </h6>
                <p className="text-sm text-gray-600">Require 2FA for admin login</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.two_factor_enabled}
                  onChange={(e) => onUpdate('two_factor_enabled', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.two_factor_enabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.two_factor_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
              <div>
                <h6 className="font-medium text-white flex items-center gap-2">
                  <Globe size={16} />
                  IP Whitelist
                </h6>
                <p className="text-sm text-gray-600">Restrict admin access to specific IP addresses</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ip_whitelist_enabled}
                  onChange={(e) => onUpdate('ip_whitelist_enabled', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.ip_whitelist_enabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.ip_whitelist_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
              <div>
                <h6 className="font-medium text-white flex items-center gap-2">
                  <Shield size={16} />
                  Rate Limiting
                </h6>
                <p className="text-sm text-gray-600">Enable API rate limiting for security</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.rate_limit_enabled}
                  onChange={(e) => onUpdate('rate_limit_enabled', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  settings.rate_limit_enabled ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.rate_limit_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Security Notice</p>
              <p className="text-yellow-700 mt-1">
                Changes to security settings may affect platform access. Test thoroughly in a safe environment before applying to production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}