import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEmojiTown } from '@/hooks/use-emoji-town';
import { StarterPackPhase } from './phases/StarterPackPhase';
import { RecruitCitizensPhase } from './phases/RecruitCitizensPhase';
import { WelcomeCenterPhase } from './phases/WelcomeCenterPhase';
import { TownBuildingPhase } from './phases/TownBuildingPhase';
import { SecondaryPairingPhase } from './phases/SecondaryPairingPhase';
import type { PhaseType } from '@/lib/types';

const PHASES = [
  { id: 'starter-pack', label: '📦 Pack Opening', component: StarterPackPhase },
  { id: 'recruit-citizens', label: '👥 Recruit Citizens', component: RecruitCitizensPhase },
  { id: 'welcome-center', label: '💕 Welcome Center', component: WelcomeCenterPhase },
  { id: 'town-building', label: '🏘️ Town Building', component: TownBuildingPhase },
  { id: 'secondary-pairing', label: '🔄 Secondary Pairing', component: SecondaryPairingPhase },
] as const;

export function EmojiTown() {
  const { gameState, switchPhase, isLoading } = useEmojiTown();
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('starter-pack');

  const handlePhaseSwitch = (phase: PhaseType) => {
    setCurrentPhase(phase);
    switchPhase(phase);
  };

  const CurrentPhaseComponent = PHASES.find(p => p.id === currentPhase)?.component || StarterPackPhase;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏘️</div>
          <div className="text-lg font-semibold">Loading Emoji Town...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="bg-white/95 backdrop-blur rounded-3xl p-8 mb-6 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-4 drop-shadow-lg">🏘️ Emoji Town</h1>
            <p className="text-xl text-gray-600">Build your community through pack opening, citizen recruitment, and family formation!</p>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-6 rounded-2xl shadow-inner">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameState?.packsOpened || 0}</div>
              <div className="text-sm text-gray-600">Packs Opened</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameState?.totalCitizens || 0}</div>
              <div className="text-sm text-gray-600">Citizens Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameState?.totalFamilies || 0}</div>
              <div className="text-sm text-gray-600">Families Formed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameState?.buildingsPopulated || 0}</div>
              <div className="text-sm text-gray-600">Buildings Filled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameState?.adoptions || 0}</div>
              <div className="text-sm text-gray-600">Adoptions</div>
            </div>
          </div>
        </Card>

        {/* Phase Navigation */}
        <Card className="bg-white/95 backdrop-blur rounded-2xl p-2 mb-6 shadow-lg">
          <div className="flex flex-wrap justify-center gap-2">
            {PHASES.map(phase => (
              <Button
                key={phase.id}
                variant={currentPhase === phase.id ? "default" : "outline"}
                onClick={() => handlePhaseSwitch(phase.id as PhaseType)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentPhase === phase.id 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {phase.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Current Phase Content */}
        <CurrentPhaseComponent />
      </div>
    </div>
  );
}
