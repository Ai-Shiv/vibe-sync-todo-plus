
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Palette, Save, RotateCcw } from 'lucide-react';
import { predefinedThemes, applyTheme, createCustomTheme, CustomTheme } from '@/utils/themeManager';

interface ThemeCustomizerProps {
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onClose }) => {
  const [selectedTheme, setSelectedTheme] = useState<CustomTheme>(predefinedThemes[0]);
  const [customColors, setCustomColors] = useState(predefinedThemes[0].colors);
  const [customName, setCustomName] = useState('My Custom Theme');

  const handleThemeSelect = (theme: CustomTheme) => {
    setSelectedTheme(theme);
    setCustomColors(theme.colors);
    applyTheme(theme);
  };

  const handleColorChange = (colorKey: keyof CustomTheme['colors'], value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);
    
    // Apply preview
    const previewTheme = createCustomTheme('Preview', newColors);
    applyTheme(previewTheme);
  };

  const saveCustomTheme = () => {
    const newTheme = createCustomTheme(customName, customColors);
    applyTheme(newTheme);
    
    // Save to localStorage
    const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
    customThemes.push(newTheme);
    localStorage.setItem('customThemes', JSON.stringify(customThemes));
    
    onClose();
  };

  const resetToDefault = () => {
    handleThemeSelect(predefinedThemes[0]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            Theme Customizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Predefined Themes */}
          <div>
            <h3 className="text-white font-medium mb-3">Predefined Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {predefinedThemes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedTheme.id === theme.id
                      ? 'border-purple-400 bg-purple-600/20'
                      : 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-full h-8 rounded"
                      style={{ background: theme.gradients.primary }}
                    />
                    <span className="text-xs text-white">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Theme Builder */}
          <div className="border-t border-slate-600 pt-6">
            <h3 className="text-white font-medium mb-3">Custom Theme</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Theme Name</Label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {Object.entries(customColors).map(([key, value]) => (
                  <div key={key}>
                    <Label className="text-slate-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                        className="w-16 h-10 bg-slate-700 border-slate-600"
                      />
                      <Input
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof CustomTheme['colors'], e.target.value)}
                        className="flex-1 bg-slate-700 border-slate-600 text-white"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Preview</h4>
                <div className="bg-slate-700/30 p-4 rounded-lg space-y-3">
                  <div
                    className="h-16 rounded"
                    style={{ background: `linear-gradient(135deg, ${customColors.primary} 0%, ${customColors.secondary} 100%)` }}
                  />
                  <div
                    className="h-8 rounded"
                    style={{ backgroundColor: customColors.surface }}
                  />
                  <div className="flex gap-2">
                    <Badge style={{ backgroundColor: customColors.accent, color: customColors.text }}>
                      Accent
                    </Badge>
                    <Badge style={{ backgroundColor: customColors.primary, color: customColors.text }}>
                      Primary
                    </Badge>
                  </div>
                  <div
                    className="p-3 rounded text-sm"
                    style={{ 
                      backgroundColor: customColors.background,
                      color: customColors.text 
                    }}
                  >
                    Sample text with{' '}
                    <span style={{ color: customColors.textSecondary }}>
                      secondary text
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-slate-600">
            <div className="flex gap-2">
              <Button
                onClick={resetToDefault}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={saveCustomTheme}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Theme
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeCustomizer;
