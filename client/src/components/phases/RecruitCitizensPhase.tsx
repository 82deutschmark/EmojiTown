import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEmojiTown } from '@/hooks/use-emoji-town';
import { createCitizen } from '@/lib/zwj-engine';
import { EMOJI_CATEGORIES } from '@/lib/starter-pack-generator';

export function RecruitCitizensPhase() {
  const { 
    selectedBase,
    selectedSkinTone,
    setSelectedBase,
    setSelectedSkinTone,
    recruitCitizen,
    isRecruitingCitizen,
    canRecruitCitizen,
    citizens,
    getEmojiCount
  } = useEmojiTown();

  const handleSelectComponent = (emoji: string, category: 'people' | 'skinTones') => {
    if (category === 'people') {
      setSelectedBase(emoji);
    } else {
      setSelectedSkinTone(emoji);
    }
  };

  const handleRecruitCitizen = () => {
    if (canRecruitCitizen) {
      recruitCitizen({ baseEmoji: selectedBase, skinTone: selectedSkinTone });
    }
  };

  const combinationResult = canRecruitCitizen ? createCitizen(selectedBase, selectedSkinTone) : null;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* ZWJ Combination Engine */}
      <div className="lg:col-span-2">
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 text-center">👥 Citizen Recruitment Center</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Combination Workspace */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-700 mb-4">Combine Components:</h3>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                {/* Base Person Slot */}
                <div className="w-20 h-20 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-3xl cursor-pointer hover:border-blue-600 transition-all">
                  {selectedBase ? (
                    <span>{selectedBase}</span>
                  ) : (
                    <span className="text-gray-400">👤</span>
                  )}
                </div>
                
                <div className="text-2xl text-gray-500">+</div>
                
                {/* Skin Tone Slot */}
                <div className="w-20 h-20 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-3xl cursor-pointer hover:border-blue-600 transition-all">
                  {selectedSkinTone ? (
                    <span>{selectedSkinTone}</span>
                  ) : (
                    <span className="text-gray-400">🎨</span>
                  )}
                </div>
                
                <div className="text-2xl text-gray-500">=</div>
                
                {/* Result Slot */}
                <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl shadow-lg ${
                  combinationResult?.valid ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border-2 border-gray-300'
                }`}>
                  {combinationResult?.valid ? (
                    <span className="animate-pulse">{combinationResult.result}</span>
                  ) : (
                    <span className="text-gray-400">?</span>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={handleRecruitCitizen}
                  disabled={!canRecruitCitizen || isRecruitingCitizen}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-lg hover:bg-green-700"
                >
                  {isRecruitingCitizen ? 'Recruiting...' : '✨ Recruit Citizen'}
                </Button>
              </div>
            </div>

            {/* ZWJ Validation Status */}
            {combinationResult && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${combinationResult.valid ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">ZWJ Engine Status: </span>
                  <span className={`text-sm font-semibold ${combinationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {combinationResult.valid ? 'Valid Unicode Sequence' : combinationResult.error}
                  </span>
                </div>
                {combinationResult.valid && combinationResult.unicodeSequence && (
                  <div className="text-xs text-gray-500 mt-2">
                    Unicode: {combinationResult.unicodeSequence}
                  </div>
                )}
              </div>
            )}

            {/* Recruited Citizens */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
                🏘️ Recruited Citizens
                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                  {citizens?.length || 0}
                </span>
              </h3>
              <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                {citizens?.map((citizen, index) => (
                  <div key={citizen.id || index} className="relative group">
                    <div className="text-2xl p-2 bg-white rounded-lg shadow-sm hover:scale-110 transition-all cursor-pointer">
                      {citizen.emoji}
                    </div>
                    <div className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded transition-opacity z-10">
                      {citizen.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Selector */}
      <div>
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Available Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Base People */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Base People</h4>
                <div className="grid grid-cols-3 gap-2">
                  {EMOJI_CATEGORIES.people.map(emoji => {
                    const count = getEmojiCount(emoji, 'people');
                    return (
                      <div 
                        key={emoji}
                        onClick={() => count > 0 && handleSelectComponent(emoji, 'people')}
                        className={`text-2xl p-2 bg-white rounded-lg shadow-sm transition-all cursor-pointer border-2 ${
                          selectedBase === emoji 
                            ? 'border-blue-600 scale-110' 
                            : count > 0 
                              ? 'border-transparent hover:border-blue-600 hover:scale-110' 
                              : 'border-transparent opacity-30 cursor-not-allowed'
                        }`}
                      >
                        {emoji}
                        {count > 0 && (
                          <div className="text-xs text-center text-gray-500">{count}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Skin Tones */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Skin Tones</h4>
                <div className="grid grid-cols-3 gap-2">
                  {EMOJI_CATEGORIES.skinTones.map(emoji => {
                    const count = getEmojiCount(emoji, 'skinTones');
                    return (
                      <div 
                        key={emoji}
                        onClick={() => count > 0 && handleSelectComponent(emoji, 'skinTones')}
                        className={`text-2xl p-2 bg-white rounded-lg shadow-sm transition-all cursor-pointer border-2 ${
                          selectedSkinTone === emoji 
                            ? 'border-blue-600 scale-110' 
                            : count > 0 
                              ? 'border-transparent hover:border-blue-600 hover:scale-110' 
                              : 'border-transparent opacity-30 cursor-not-allowed'
                        }`}
                      >
                        {emoji}
                        {count > 0 && (
                          <div className="text-xs text-center text-gray-500">{count}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
