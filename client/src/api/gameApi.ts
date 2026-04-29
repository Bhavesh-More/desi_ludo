import axios from "axios"
import { type GameSnapshot, type ShellFace } from "../types/gameTypes"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080"

export interface CreateSessionResponse {
	sessionId: string
	snapshot: GameSnapshot
}

export interface RollResponse {
	roll: number
	shellFaces: ShellFace[]
	validMoves: number[]
	snapshot: GameSnapshot
}

export interface MoveResponse {
	captured: boolean
	snapshot: GameSnapshot
}

export async function createSession(playerNames: string[]) {
	const response = await axios.post<CreateSessionResponse>(`${API_BASE}/api/session/create`, {
		playerNames
	})

	return response.data
}

export async function getSessionState(sessionId: string) {
	const response = await axios.get<GameSnapshot>(`${API_BASE}/api/session/${sessionId}/state`)
	return response.data
}

export async function rollShells(sessionId: string, playerId: number) {
	const response = await axios.post<RollResponse>(`${API_BASE}/api/session/${sessionId}/roll`, {
		playerId
	})

	return response.data
}

export async function moveToken(sessionId: string, playerId: number, tokenId: number) {
	const response = await axios.post<MoveResponse>(`${API_BASE}/api/session/${sessionId}/move`, {
		playerId,
		tokenId
	})

 	return response.data
}