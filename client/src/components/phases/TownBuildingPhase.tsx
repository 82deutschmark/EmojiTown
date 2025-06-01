import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmojiTown } from '@/hooks/use-emoji-town';
import type { FamilyData, BuildingData } from '@/lib/types';

const BUILDING_TYPES = [
  { type: 'fire-station', emoji: '🚒', name: 'Fire Station', capacity: 2 },
  { type: 'hospital', emoji: '🏥', name: 'Hospital', capacity: 3 },
  { type: 'school', emoji: '🏫', name: 'School', capacity: 4 },
  { type: 'restaurant', emoji: '🍽️', name: 'Restaurant', capacity: 2 },
  { type: 'police', emoji: '👮', name: 'Police', capacity: 2 },
  { type: 'airport', emoji: '✈️', name: 'Airport', capacity: 3 },
  { type: 'shop', emoji: '🏪', name: 'Shop', capacity: 2 },
  { type: 'houses', emoji: '🏘️', name: 'Houses', capacity: 6 },
] as const;

export function TownBuildingPhase() {
  const { 
    unplacedFamilies,
    buildings,
    placeFamily,
    isPlacingFamily
  } = useEmojiTown();

  const [draggedFamily, setDraggedFamily] = useState<FamilyData | null>(null);

  const handleDragStart = (family: FamilyData) => {
    setDraggedFamily(family);
  };

  const handleDragEnd = () => {
    setDraggedFamily(null);
  };

  const handleDrop = (buildingType: string, position: number) => {
    if (draggedFamily && draggedFamily.id) {
      placeFamily({
        familyId: draggedFamily.id,
        buildingType,
        position
      });
      setDraggedFamily(null);
    }
  };

  const getBuildingOccupancy = (buildingType: string, position: number) => {
    const building = buildings?.find(b => b.buildingType === buildingType && b.position === position);
    return building ? building.currentOccupancy : 0;
  };

  const getBuildingCapacity = (buildingType: string) => {
    return BUILDING_TYPES.find(bt => bt.type === buildingType)?.capacity || 1;
  };

  const getOccupantEmoji = (buildingType: string, position: number) => {
    const building = buildings?.find(b => b.buildingType === buildingType && b.position === position);
    if (building && building.occupants.length > 0) {
      // Return first occupant emoji (simplified)
      const family = unplacedFamilies.find(f => f.id === building.occupants[0]);
      return family?.emoji || '';
    }
    return '';
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Town Grid */}
      <div className="lg:col-span-3">
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 text-center">🏘️ Town Layout</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Town Map */}
            <div className="grid grid-cols-6 gap-3 bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
              {BUILDING_TYPES.map((buildingType, index) => {
                const occupancy = getBuildingOccupancy(buildingType.type, index);
                const capacity = getBuildingCapacity(buildingType.type);
                const occupantEmoji = getOccupantEmoji(buildingType.type, index);
                const isOccupied = occupancy > 0;

                return (
                  <div
                    key={`${buildingType.type}-${index}`}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all p-2 ${
                      isOccupied
                        ? 'bg-green-100 border-green-500'
                        : 'bg-white border-dashed border-gray-300 hover:border-blue-600'
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(buildingType.type, index)}
                  >
                    <div className="text-2xl mb-1">
                      {isOccupied ? occupantEmoji : buildingType.emoji}
                    </div>
                    <div className="text-xs text-gray-600">{buildingType.name}</div>
                    <div className={`text-xs ${isOccupied ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                      {occupancy}/{capacity}
                    </div>
                  </div>
                );
              })}
              
              {/* Empty expansion slots */}
              {[...Array(4)].map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center"
                >
                  <span className="text-gray-400 text-2xl">+</span>
                </div>
              ))}
            </div>

            {/* Placement Instructions */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Placement Rules:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Families are assigned to buildings based on profession compatibility</li>
                <li>• Each building has a capacity limit</li>
                <li>• Hover over buildings to see available slots</li>
                <li>• Drag families from the panel to place them</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Family Placement Panel */}
      <div>
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Available Families</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {unplacedFamilies.map((family, index) => (
                <div
                  key={family.id || index}
                  draggable
                  onDragStart={() => handleDragStart(family)}
                  onDragEnd={handleDragEnd}
                  className={`bg-gray-50 rounded-xl p-3 cursor-grab hover:shadow-lg transition-all ${
                    draggedFamily?.id === family.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="text-center mb-2">
                    <div className="text-2xl">{family.emoji}</div>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    <div>Type: {family.familyType}</div>
                    <div>Size: {family.members.length} members</div>
                  </div>
                </div>
              ))}
              
              {unplacedFamilies.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🏠</div>
                  <div>All families placed!</div>
                </div>
              )}
            </div>

            {/* Building Legend */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-700 mb-3">Building Types:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {BUILDING_TYPES.slice(0, 8).map(building => (
                  <div key={building.type} className="flex items-center space-x-2">
                    <span>{building.emoji}</span>
                    <span>{building.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
