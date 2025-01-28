import React, { useState } from 'react';
import { useOrbis } from "@orbisclub/components";
import { SketchPicker } from 'react-color';
import DonateButton from './DonateButton';

export default function DonationSettings() {
  const { orbis, user } = useOrbis();
  const [settings, setSettings] = useState(user?.details?.metadata?.donationSettings || {
    primaryColor: '#5D43FB',
    buttonStyle: 'rounded',
    size: 'medium',
    darkMode: false
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const buttonStyles = [
    { id: 'default', name: 'Default' },
    { id: 'rounded', name: 'Rounded' },
    { id: 'pill', name: 'Pill' }
  ];

  const sizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' }
  ];

  const presetColors = [
    '#5D43FB', // Brand color
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#000000'  // Black
  ];

  async function saveSettings() {
    setSaving(true);
    try {
      // Get current profile
      const profile = user?.details?.profile || {};
      
      // Update metadata with donation settings
      const metadata = {
        ...user?.details?.metadata,
        donationSettings: settings
      };

      // Save to Orbis profile
      const res = await orbis.updateProfile({
        ...profile,
        metadata
      });

      if(res.status === 200) {
        alert("Donation settings saved successfully!");
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Donation Widget Settings</h2>

      {/* Color Picker */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Color
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {presetColors.map((color) => (
            <button
              key={color}
              onClick={() => setSettings({ ...settings, primaryColor: color })}
              className={`w-8 h-8 rounded-full border-2 ${
                settings.primaryColor === color ? 'border-gray-400' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showColorPicker ? 'Close Color Picker' : 'Custom Color'}
        </button>
        {showColorPicker && (
          <div className="absolute mt-2 z-10">
            <SketchPicker
              color={settings.primaryColor}
              onChange={(color) => setSettings({ ...settings, primaryColor: color.hex })}
              presetColors={presetColors}
            />
          </div>
        )}
      </div>

      {/* Button Style */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Button Style
        </label>
        <div className="grid grid-cols-3 gap-3">
          {buttonStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSettings({ ...settings, buttonStyle: style.id })}
              className={`
                px-4 py-2 text-sm font-medium rounded-md
                ${settings.buttonStyle === style.id
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }
                border
              `}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Widget Size
        </label>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setSettings({ ...settings, size: size.id })}
              className={`
                px-4 py-2 text-sm font-medium rounded-md
                ${settings.size === size.id
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }
                border
              `}
            >
              {size.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-700">Enable Dark Mode</span>
        </label>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
        <div className="p-4 border border-gray-200 rounded-lg">
          <DonateButton
            post={{
              stream_id: 'preview',
              content: {
                title: 'Preview Post',
                body: 'This is how your donation widget will look'
              },
              creator_details: {
                metadata: {
                  address: user?.details?.metadata?.address,
                  donationSettings: settings
                }
              }
            }}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </button>
    </div>
  );
}