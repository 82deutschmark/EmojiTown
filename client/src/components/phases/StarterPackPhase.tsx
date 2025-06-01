import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEmojiTown } from '@/hooks/use-emoji-town';
import { expandPackToGrid } from '@/lib/starter-pack-generator';

export function StarterPackPhase() {
  const { 
    emojiCollection, 
    generateStarterPack, 
    isGeneratingPack,
    getEmojiCount 
  } = useEmojiTown();
  
  const [showGrid, setShowGrid] = useState(false);

  const handleGeneratePack = () => {
    generateStarterPack();
    setShowGrid(true);
  };

  const packGrid = emojiCollection ? expandPackToGrid(emojiCollection) : [];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Pack Generation Controls */}
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800 text-center">Generate Starter Pack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="relative w-48 h-64 mx-auto mb-6 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center text-6xl cursor-pointer transition-all hover:scale-105 hover:-translate-y-2 shadow-xl overflow-hidden group">
              <span className="relative z-10">📦</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            </div>
            <Button 
              onClick={handleGeneratePack}
              disabled={isGeneratingPack}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-all shadow-lg"
            >
              {isGeneratingPack ? 'Generating...' : 'Generate Starter Pack'}
            </Button>
          </div>

          {/* Pack Distribution */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">Pack Distribution:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Base People:</span>
                <span className="font-semibold">6 (2 each)</span>
              </div>
              <div className="flex justify-between">
                <span>Skin Tones:</span>
                <span className="font-semibold">15 (3 each)</span>
              </div>
              <div className="flex justify-between">
                <span>Professions:</span>
                <span className="font-semibold">25</span>
              </div>
              <div className="flex justify-between">
                <span>Wildcards:</span>
                <span className="font-semibold">54</span>
              </div>
            </div>
          </div>

          {/* Pack Grid */}
          {showGrid && packGrid.length > 0 && (
            <div className="grid grid-cols-10 gap-1 bg-gray-50 p-4 rounded-xl max-h-96 overflow-y-auto">
              {packGrid.map((emoji, index) => (
                <div 
                  key={index}
                  className="aspect-square bg-white rounded-lg flex items-center justify-center text-lg cursor-pointer hover:scale-110 transition-all shadow-sm"
                >
                  {emoji}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Component Collection */}
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800 text-center">Component Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Base People */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
                👥 Base People 
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  {getEmojiCount('👨', 'people') + getEmojiCount('👩', 'people') + getEmojiCount('🧑', 'people')}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {['👨', '👩', '🧑'].map(emoji => {
                  const count = getEmojiCount(emoji, 'people');
                  return count > 0 ? (
                    <div key={emoji} className="relative">
                      <div className="text-2xl p-2 bg-white rounded-lg shadow-sm hover:scale-110 transition-all">
                        {emoji}
                      </div>
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {count}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Skin Tones */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
                🎨 Skin Tones 
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  {['🏻', '🏼', '🏽', '🏾', '🏿'].reduce((sum, emoji) => sum + getEmojiCount(emoji, 'skinTones'), 0)}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {['🏻', '🏼', '🏽', '🏾', '🏿'].map(emoji => {
                  const count = getEmojiCount(emoji, 'skinTones');
                  return count > 0 ? (
                    <div key={emoji} className="relative">
                      <div className="text-2xl p-2 bg-white rounded-lg shadow-sm hover:scale-110 transition-all">
                        {emoji}
                      </div>
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {count}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Professions */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
                💼 Professions 
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  {emojiCollection?.filter(item => item.category === 'professions').reduce((sum, item) => sum + item.count, 0) || 0}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {emojiCollection?.filter(item => item.category === 'professions').slice(0, 8).map(item => (
                  <div key={item.emoji} className="relative">
                    <div className="text-2xl p-2 bg-white rounded-lg shadow-sm hover:scale-110 transition-all">
                      {item.emoji}
                    </div>
                    {item.count > 1 && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {item.count}
                      </div>
                    )}
                  </div>
                ))}
                {emojiCollection && emojiCollection.filter(item => item.category === 'professions').length > 8 && (
                  <div className="text-sm text-gray-500 p-2 flex items-center">
                    +{emojiCollection.filter(item => item.category === 'professions').length - 8} more...
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
