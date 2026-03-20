import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlayerScore {
    name: string;
    score: bigint;
}
export interface backendInterface {
    clearScores(adminCode: string): Promise<void>;
    getTopScores(): Promise<Array<PlayerScore>>;
    submitScore(name: string, score: bigint): Promise<void>;
}
