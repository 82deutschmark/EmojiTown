import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmojiTown } from '@/hooks/use-emoji-town';
import type { CitizenData, FamilyData } from '@/lib/types';

export function SecondaryPairingPhase() {
  const { 
    citizens,
    families,
    getAvailableChildren,
    formWorkplaceCouple,
    processAdoption,
    isFormingCouple,
    isProcessingAdoption
  } = useEmojiTown();

  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedCitizen1, setSelectedCitizen1] = useState<CitizenData | null>(null);
  const [selectedCitizen2, setSelectedCitizen2] = useState<CitizenData | null>(null);
  const [selectedCouple, setSelectedCouple] = useState<FamilyData | null>(null);
  const [selectedChild, setSelectedChild] = useState<CitizenData | null>(null);

  const buildingsWithSingles = [
    { type: 'fire-station', emoji: '🚒', name: 'Fire Station' },
    { type: 'hospital', emoji: '🏥', name: 'Hospital' },
    { type: 'school', emoji: '🏫', name: 'School' },
    { type: 'police', emoji: '👮', name: 'Police' },
  ];

  const getSinglesAtBuilding = (buildingType: string) => {
    return citizens?.filter(citizen => 
      citizen.buildingType === buildingType && 
      citizen.status === 'placed' &&
      !families?.some(family => family.members.includes(citizen.id!))
    ) || [];
  };

  const getCouples = () => {
    return families?.filter(family => 
      family.familyType === 'couple' && 
      family.isPlaced
    ) || [];
  };

  const availableChildren = getAvailableChildren();
  const couples = getCouples();

  const handleSelectBuilding = (buildingType: string) => {
    setSelectedBuilding(buildingType);
    setSelectedCitizen1(null);
    setSelectedCitizen2(null);
  };

  const handleSelectCitizen = (citizen: CitizenData) => {
    if (!selectedCitizen1) {
      setSelectedCitizen1(citizen);
    } else if (selectedCitizen1.id === citizen.id) {
      setSelectedCitizen1(null);
    } else if (!selectedCitizen2) {
      setSelectedCitizen2(citizen);
    } else {
      setSelectedCitizen2(citizen);
    }
  };

  const handleFormCouple = () => {
    if (selectedCitizen1 && selectedCitizen2 && selectedBuilding) {
      formWorkplaceCouple({
        citizen1Id: selectedCitizen1.id!,
        citizen2Id: selectedCitizen2.id!,
        buildingType: selectedBuilding
      });
      setSelectedCitizen1(null);
      setSelectedCitizen2(null);
    }
  };

  const handleProcessAdoption = () => {
    if (selectedCouple && selectedChild) {
      processAdoption({
        familyId: selectedCouple.id!,
        childId: selectedChild.id!
      });
      setSelectedCouple(null);
      setSelectedChild(null);
    }
  };

  const singlesAtSelectedBuilding = selectedBuilding ? getSinglesAtBuilding(selectedBuilding) : [];
  const selectedBuildingInfo = buildingsWithSingles.find(b => b.type === selectedBuilding);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Secondary Pairing Center */}
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800 text-center">🔄 Secondary Pairing & Adoption</CardTitle>
          <p className="text-gray-600 text-center">Connect singles at the same workplace and facilitate adoptions</p>
        </CardHeader>
        <CardContent>
          {/* Building Selection */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Select Building for Pairing</h4>
            <div className="grid grid-cols-2 gap-3">
              {buildingsWithSingles.map(building => {
                const singlesCount = getSinglesAtBuilding(building.type).length;
                return (
                  <Button
                    key={building.type}
                    variant={selectedBuilding === building.type ? "default" : "outline"}
                    onClick={() => handleSelectBuilding(building.type)}
                    className="p-4 h-auto flex flex-col items-center space-y-2"
                  >
                    <div className="text-3xl">{building.emoji}</div>
                    <div className="text-xs">{building.name}</div>
                    <div className="text-xs text-blue-600 font-semibold">
                      {singlesCount} singles
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Singles at Selected Building */}
          {selectedBuilding && selectedBuildingInfo && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-gray-700 mb-3">
                Singles at {selectedBuildingInfo.name} {selectedBuildingInfo.emoji}
              </h5>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {singlesAtSelectedBuilding.map((citizen, index) => (
                  <div
                    key={citizen.id || index}
                    onClick={() => handleSelectCitizen(citizen)}
                    className={`aspect-square bg-white rounded-lg shadow-sm flex items-center justify-center text-2xl cursor-pointer transition-all hover:scale-105 border-2 ${
                      selectedCitizen1?.id === citizen.id || selectedCitizen2?.id === citizen.id
                        ? 'border-blue-600 bg-blue-100'
                        : 'border-transparent hover:border-blue-300'
                    }`}
                  >
                    {citizen.emoji}
                  </div>
                ))}
              </div>
              
              {/* Pairing Interface */}
              {selectedCitizen1 && selectedCitizen2 && (
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl border-2 border-blue-600">
                    {selectedCitizen1.emoji}
                  </div>
                  <span className="text-2xl">💕</span>
                  <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl border-2 border-blue-600">
                    {selectedCitizen2.emoji}
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleFormCouple}
                disabled={!selectedCitizen1 || !selectedCitizen2 || isFormingCouple}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                {isFormingCouple ? 'Forming...' : 'Form Couple at Workplace'}
              </Button>
            </div>
          )}

          {/* Adoption Interface */}
          <div className="bg-purple-50 rounded-xl p-4">
            <h5 className="font-semibold text-gray-700 mb-3">👶 Adoption Center</h5>
            <div className="text-sm text-gray-600 mb-3">Couples can adopt children from the Hospital</div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Available Couples */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Select Couple</label>
                <Select onValueChange={(value) => setSelectedCouple(couples.find(c => c.id?.toString() === value) || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose couple..." />
                  </SelectTrigger>
                  <SelectContent>
                    {couples.map(couple => (
                      <SelectItem key={couple.id} value={couple.id?.toString() || ''}>
                        {couple.emoji} ({couple.buildingType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Available Children */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Available Children</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableChildren.map((child, index) => (
                    <div
                      key={child.id || index}
                      onClick={() => setSelectedChild(selectedChild?.id === child.id ? null : child)}
                      className={`aspect-square bg-white rounded-lg shadow-sm flex items-center justify-center text-xl cursor-pointer transition-all hover:scale-105 border-2 ${
                        selectedChild?.id === child.id
                          ? 'border-purple-600 bg-purple-100'
                          : 'border-transparent hover:border-purple-300'
                      }`}
                    >
                      {child.emoji}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleProcessAdoption}
              disabled={!selectedCouple || !selectedChild || isProcessingAdoption}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
            >
              {isProcessingAdoption ? 'Processing...' : 'Process Adoption'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Tracking */}
      <div className="space-y-6">
        {/* Active Relationships */}
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">💕 Active Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {families?.filter(family => family.familyType === 'couple').map((couple, index) => (
                <div key={couple.id || index} className="bg-gradient-to-r from-pink-50 to-red-50 rounded-lg p-3 border border-pink-200">
                  <div className="text-2xl text-center mb-1">{couple.emoji}</div>
                  <div className="text-xs text-center text-gray-600">
                    {couple.buildingType} Couple
                  </div>
                  <div className="text-xs text-center text-blue-600 font-semibold">
                    Status: {couple.isPlaced ? 'Active' : 'Forming'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Complex Families */}
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">👨‍👩‍👧‍👦 Complex Families</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {families?.filter(family => family.members.length > 2).map((family, index) => (
                <div key={family.id || index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
                  <div className="text-3xl text-center mb-1">{family.emoji}</div>
                  <div className="text-xs text-center text-gray-600">
                    {family.familyType} ({family.members.length} members)
                  </div>
                  <div className="text-xs text-center text-blue-600 font-semibold">
                    {family.buildingType}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">📊 Pairing Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Families:</span>
                <span className="font-semibold text-green-600">{families?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Couples:</span>
                <span className="font-semibold text-pink-600">
                  {families?.filter(f => f.familyType === 'couple').length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Complex Families:</span>
                <span className="font-semibold text-purple-600">
                  {families?.filter(f => f.members.length > 2).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Available Children:</span>
                <span className="font-semibold text-blue-600">{availableChildren.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
