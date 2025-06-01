import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEmojiTown } from "@/hooks/use-emoji-town";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface GeneratedCitizen {
  baseEmoji: string;
  skinTone: string;
  resultEmoji: string;
  unicodeSequence: string;
}

interface GenerationResult {
  citizens: GeneratedCitizen[];
  usedComponents: { baseEmoji: string; skinTone: string }[];
  canGenerateMore: boolean;
}

export function RecruitCitizensPhase() {
  const { gameState, citizens, isLoading, switchPhase } = useEmojiTown();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [generatedCitizens, setGeneratedCitizens] = useState<GenerationResult | null>(null);

  const generateCitizensMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/generate-citizens');
      return response.json();
    },
    onSuccess: (data: GenerationResult) => {
      setGeneratedCitizens(data);
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Could not generate citizens from your collection.",
        variant: "destructive",
      });
    },
  });

  const acceptCitizensMutation = useMutation({
    mutationFn: async () => {
      if (!generatedCitizens) throw new Error("No citizens to accept");
      
      const response = await apiRequest('POST', '/api/accept-citizens', {
        citizens: generatedCitizens.citizens,
        usedComponents: generatedCitizens.usedComponents
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/citizens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emoji-collection'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      setGeneratedCitizens(null);
      toast({
        title: "Citizens accepted!",
        description: "Your new citizens have been added to the Welcome Center.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept citizens",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    generateCitizensMutation.mutate();
  };

  const handleReroll = () => {
    generateCitizensMutation.mutate();
  };

  const handleAccept = () => {
    acceptCitizensMutation.mutate();
  };

  const handleGoToWelcomeCenter = () => {
    switchPhase.mutate({ phase: "welcome-center" });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Recruit Citizens</h2>
        <p className="text-gray-600 mb-4">
          We automatically generate diverse citizens from your emoji collection using Unicode ZWJ sequences.
        </p>
        <Badge variant="outline" className="mb-6">
          Citizens Created: {gameState?.totalCitizens || 0}
        </Badge>
      </div>

      {/* Generated Citizens Display */}
      {generatedCitizens && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Citizens</CardTitle>
            <CardDescription>
              These citizens were created using proper Unicode combinations from your collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {generatedCitizens.citizens.map((citizen, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <div className="text-6xl mb-3">{citizen.resultEmoji}</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Base: {citizen.baseEmoji}</div>
                    <div>Skin: {citizen.skinTone}</div>
                    <div className="text-xs font-mono">
                      {citizen.unicodeSequence}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleReroll}
                disabled={generateCitizensMutation.isPending}
              >
                {generateCitizensMutation.isPending ? "Generating..." : "Reroll"}
              </Button>
              <Button
                onClick={handleAccept}
                disabled={acceptCitizensMutation.isPending}
              >
                {acceptCitizensMutation.isPending ? "Accepting..." : "Accept Citizens"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial Generation */}
      {!generatedCitizens && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Recruit</CardTitle>
            <CardDescription>
              Generate 3 random citizens from your emoji collection
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={handleGenerate}
              disabled={generateCitizensMutation.isPending}
              className="px-8"
            >
              {generateCitizensMutation.isPending ? "Generating..." : "Generate Citizens"}
            </Button>
            
            {/* Helpful message about component availability */}
            <div className="mt-4 text-sm text-gray-600">
              <p>Need more components? Generate additional starter packs in the previous phase.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Citizens */}
      {citizens && citizens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Citizens Ready for Welcome Center ({citizens.length})</CardTitle>
            <CardDescription>
              These citizens are available for family formation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-3 mb-6">
              {citizens.map((citizen) => (
                <div key={citizen.id} className="text-center">
                  <div className="text-3xl mb-1">{citizen.emoji}</div>
                  <Badge variant="secondary" className="text-xs">
                    {citizen.status}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleGenerate}
                disabled={generateCitizensMutation.isPending}
                variant="outline"
              >
                Generate More Citizens
              </Button>
              <Button
                onClick={handleGoToWelcomeCenter}
                disabled={switchPhase.isPending}
              >
                Go to Welcome Center →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>We automatically combine base people emoji with skin tones using Unicode ZWJ sequences</li>
              <li>Each generation uses components from your starter pack collection</li>
              <li>You can reroll to get different combinations or accept the generated citizens</li>
              <li>Accepted citizens move to the Welcome Center where they can form families</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}