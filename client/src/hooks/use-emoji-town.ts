import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { 
  GameStateData, 
  EmojiComponent, 
  CitizenData, 
  FamilyData, 
  BuildingData, 
  PhaseType 
} from '@/lib/types';

export function useEmojiTown() {
  const queryClient = useQueryClient();
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [selectedSkinTone, setSelectedSkinTone] = useState<string>('');
  const [selectedCitizens, setSelectedCitizens] = useState<CitizenData[]>([]);

  // Fetch game state
  const { data: gameState, isLoading: gameStateLoading } = useQuery<GameStateData>({
    queryKey: ['/api/game-state'],
  });

  // Fetch emoji collection
  const { data: emojiCollection, isLoading: collectionLoading } = useQuery<EmojiComponent[]>({
    queryKey: ['/api/emoji-collection'],
  });

  // Fetch citizens
  const { data: citizens, isLoading: citizensLoading } = useQuery<CitizenData[]>({
    queryKey: ['/api/citizens'],
  });

  // Fetch families
  const { data: families, isLoading: familiesLoading } = useQuery<FamilyData[]>({
    queryKey: ['/api/families'],
  });

  // Fetch buildings
  const { data: buildings, isLoading: buildingsLoading } = useQuery<BuildingData[]>({
    queryKey: ['/api/buildings'],
  });

  // Generate starter pack mutation
  const generatePackMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/generate-starter-pack');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emoji-collection'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
    },
  });

  // Recruit citizen mutation
  const recruitCitizenMutation = useMutation({
    mutationFn: async (data: { baseEmoji: string; skinTone: string }) => {
      const response = await apiRequest('POST', '/api/recruit-citizen', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/citizens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emoji-collection'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      setSelectedBase('');
      setSelectedSkinTone('');
    },
  });

  // Form family mutation
  const formFamilyMutation = useMutation({
    mutationFn: async (data: { adults: number[]; children?: number[] }) => {
      const response = await apiRequest('POST', '/api/form-family', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families'] });
      queryClient.invalidateQueries({ queryKey: ['/api/citizens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      setSelectedCitizens([]);
    },
  });

  // Place family mutation
  const placeFamilyMutation = useMutation({
    mutationFn: async (data: { familyId: number; buildingType: string; position: number }) => {
      const response = await apiRequest('POST', '/api/place-family', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buildings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
    },
  });

  // Form workplace couple mutation
  const formWorkplaceCoupleMutation = useMutation({
    mutationFn: async (data: { citizen1Id: number; citizen2Id: number; buildingType: string }) => {
      const response = await apiRequest('POST', '/api/form-workplace-couple', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families'] });
      queryClient.invalidateQueries({ queryKey: ['/api/citizens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
    },
  });

  // Process adoption mutation
  const processAdoptionMutation = useMutation({
    mutationFn: async (data: { familyId: number; childId: number }) => {
      const response = await apiRequest('POST', '/api/process-adoption', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families'] });
      queryClient.invalidateQueries({ queryKey: ['/api/citizens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
    },
  });

  // Switch phase mutation
  const switchPhaseMutation = useMutation({
    mutationFn: async (data: { phase: PhaseType }) => {
      const response = await apiRequest('POST', '/api/phase-transition', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
    },
  });

  // Helper functions
  const canRecruitCitizen = selectedBase && selectedSkinTone;
  
  const availableCitizens = citizens?.filter(citizen => citizen.status === 'available') || [];
  
  const unplacedFamilies = families?.filter(family => !family.isPlaced) || [];
  
  const getEmojiCount = (emoji: string, category: string) => {
    return emojiCollection?.find(item => item.emoji === emoji && item.category === category)?.count || 0;
  };

  const getAvailableChildren = () => {
    return citizens?.filter(citizen => 
      ['👶', '👧', '👦', '🧒'].some(child => citizen.emoji.includes(child)) &&
      citizen.status === 'available'
    ) || [];
  };

  const getSinglesAtBuilding = (buildingType: string) => {
    return citizens?.filter(citizen => 
      citizen.buildingType === buildingType && 
      citizen.status === 'placed'
    ) || [];
  };

  return {
    // State
    gameState,
    emojiCollection,
    citizens,
    families,
    buildings,
    selectedBase,
    selectedSkinTone,
    selectedCitizens,
    
    // Loading states
    isLoading: gameStateLoading || collectionLoading || citizensLoading || familiesLoading || buildingsLoading,
    
    // Actions
    setSelectedBase,
    setSelectedSkinTone,
    setSelectedCitizens,
    generateStarterPack: generatePackMutation.mutate,
    recruitCitizen: recruitCitizenMutation.mutate,
    formFamily: formFamilyMutation.mutate,
    placeFamily: placeFamilyMutation.mutate,
    formWorkplaceCouple: formWorkplaceCoupleMutation.mutate,
    processAdoption: processAdoptionMutation.mutate,
    switchPhase: switchPhaseMutation,
    
    // Computed values
    canRecruitCitizen,
    availableCitizens,
    unplacedFamilies,
    getEmojiCount,
    getAvailableChildren,
    getSinglesAtBuilding,
    
    // Loading states for mutations
    isGeneratingPack: generatePackMutation.isPending,
    isRecruitingCitizen: recruitCitizenMutation.isPending,
    isFormingFamily: formFamilyMutation.isPending,
    isPlacingFamily: placeFamilyMutation.isPending,
    isFormingCouple: formWorkplaceCoupleMutation.isPending,
    isProcessingAdoption: processAdoptionMutation.isPending,
  };
}
