import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlayerScore } from "../backend.d";
import { useActor } from "./useActor";

export function useGetTopScores() {
  const { actor, isFetching } = useActor();
  return useQuery<PlayerScore[]>({
    queryKey: ["topScores"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopScores();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      score,
    }: {
      name: string;
      score: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.submitScore(name, score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topScores"] });
    },
  });
}
