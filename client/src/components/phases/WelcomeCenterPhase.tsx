import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEmojiTown } from '@/hooks/use-emoji-town';
import { createFamily, getFamilyType } from '@/lib/zwj-engine';
import type { CitizenData } from '@/lib/types';

export function WelcomeCenterPhase() {
  const { 
    availableCitizens,
    families,
    formFamily,
    isFormingFamily
  } = useEmojiTown();

  const [selectedAdult1, setSelectedAdult1] = useState<CitizenData | null>(null);
  const [selectedAdult2, setSelectedAdult2] = useState<CitizenData | null>(null);
  const [selectedChildren, setSelectedChildren] = useState<CitizenData[]>([]);

  const handleSelectCitizen = (citizen: CitizenData, role: 'adult1' | 'adult2' | 'child') => {
    if (role === 'adult1') {
      setSelectedAdult1(citizen);
    } else if (role === 'adult2') {
      setSelectedAdult2(citizen);
    } else {
      if (selectedChildren.find(c => c.id === citizen.id)) {
        setSelectedChildren(selectedChildren.filter(c => c.id !== citizen.id));
      } else if (selectedChildren.length < 2) {
        setSelectedChildren([...selectedChildren, citizen]);
      }
    }
  };

  const handleFormFamily = () => {
    const adults = [selectedAdult1, selectedAdult2].filter(Boolean).map(c => c!.id!);
    const children = selectedChildren.map(c => c.id!);
    
    if (adults.length > 0) {
      formFamily({ adults, children: children.length > 0 ? children : undefined });
      // Reset selections
      setSelectedAdult1(null);
      setSelectedAdult2(null);
      setSelectedChildren([]);
    }
  };

  const getFamilyPreview = () => {
    const adults = [selectedAdult1, selectedAdult2].filter(Boolean).map(c => c!.emoji);
    const children = selectedChildren.map(c => c.emoji);
    
    if (adults.length === 0) return '';
    
    const familyResult = createFamily(adults, children);
    return familyResult.valid ? familyResult.result : '';
  };

  const familyPreview = getFamilyPreview();
  const isAdult = (citizen: CitizenData) => !['👶', '👧', '👦', '🧒'].some(child => citizen.emoji.includes(child));
  const adults = availableCitizens.filter(isAdult);
  const children = availableCitizens.filter(citizen => !isAdult(citizen));

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Family Formation Center */}
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800 text-center">💕 Welcome Center</CardTitle>
          <p className="text-gray-600 text-center">Form couples and families from your recruited citizens</p>
        </CardHeader>
        <CardContent>
          {/* Family Builder */}
          <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">Create Family Unit:</h3>
            
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {/* Adult 1 Slot */}
              <div className="text-center">
                <div 
                  onClick={() => setSelectedAdult1(null)}
                  className="w-16 h-16 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl cursor-pointer hover:border-blue-600 transition-all mb-2"
                >
                  {selectedAdult1 ? (
                    <span>{selectedAdult1.emoji}</span>
                  ) : (
                    <span className="text-gray-400">👤</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">Adult 1</span>
              </div>
              
              {/* Adult 2 Slot */}
              <div className="text-center">
                <div 
                  onClick={() => setSelectedAdult2(null)}
                  className="w-16 h-16 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl cursor-pointer hover:border-blue-600 transition-all mb-2"
                >
                  {selectedAdult2 ? (
                    <span>{selectedAdult2.emoji}</span>
                  ) : (
                    <span className="text-gray-400">👤</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">Adult 2</span>
              </div>
              
              {/* Children Slots */}
              {[0, 1].map(index => (
                <div key={index} className="text-center">
                  <div 
                    onClick={() => selectedChildren[index] && setSelectedChildren(selectedChildren.filter((_, i) => i !== index))}
                    className="w-16 h-16 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl cursor-pointer hover:border-blue-600 transition-all mb-2"
                  >
                    {selectedChildren[index] ? (
                      <span>{selectedChildren[index].emoji}</span>
                    ) : (
                      <span className="text-gray-300">+</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">Child {index + 1}</span>
                </div>
              ))}
            </div>
            
            {/* Family Preview */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">
                {familyPreview || '👪'}
              </div>
              <span className="text-sm text-gray-600">Family Preview</span>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleFormFamily}
                disabled={!selectedAdult1 || isFormingFamily}
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
              >
                {isFormingFamily ? 'Forming...' : '💕 Form Family'}
              </Button>
            </div>
          </div>

          {/* Family Types */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Supported Family Types:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-lg">👨‍👩‍👧</span>
                <span>Traditional</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">👨‍👨‍👦</span>
                <span>Same-Sex</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">👩‍👧‍👦</span>
                <span>Single Parent</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">👨‍👩‍👧‍👦</span>
                <span>Large Family</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formed Families & Available Citizens */}
      <div className="space-y-6">
        {/* Formed Families */}
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center justify-between">
              Formed Families
              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                {families?.length || 0}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {families?.map((family, index) => (
                <div key={family.id || index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl">{family.emoji}</div>
                    <div className="text-xs text-gray-500">
                      {family.isPlaced ? 'Placed' : 'Available'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Type: {getFamilyType(family.emoji)}</div>
                    <div>Members: {family.members.length}</div>
                    {family.buildingType && (
                      <div>Location: {family.buildingType}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Citizens */}
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Available Citizens</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Adults */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Adults</h4>
              <div className="grid grid-cols-6 gap-2">
                {adults.map((citizen, index) => (
                  <div 
                    key={citizen.id || index}
                    onClick={() => handleSelectCitizen(citizen, selectedAdult1 ? 'adult2' : 'adult1')}
                    className={`text-xl p-2 bg-white rounded-lg shadow-sm transition-all cursor-pointer hover:scale-110 border-2 ${
                      selectedAdult1?.id === citizen.id || selectedAdult2?.id === citizen.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {citizen.emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Children */}
            {children.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Children</h4>
                <div className="grid grid-cols-6 gap-2">
                  {children.map((citizen, index) => (
                    <div 
                      key={citizen.id || index}
                      onClick={() => handleSelectCitizen(citizen, 'child')}
                      className={`text-xl p-2 bg-white rounded-lg shadow-sm transition-all cursor-pointer hover:scale-110 border-2 ${
                        selectedChildren.find(c => c.id === citizen.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      {citizen.emoji}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
