import { type PlayerColor, type ShellFace } from "../types/gameTypes"

export interface CreateSessionResponse {
	sessionId: string
	playerOrder: PlayerColor[]
}

export interface ThrowKawadiResponse {
	shellFaces: ShellFace[]
	moveValue: number
}

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function createSession(playerCount: number): Promise<CreateSessionResponse> {

	// Frontend-only placeholder. Replace with an HTTP request once backend is ready.
	const palette: PlayerColor[] = ["red", "blue", "green", "yellow"]
	await pause(250)

	return {
		sessionId: `mock-${Date.now()}`,
		playerOrder: palette.slice(0, playerCount)
	}

}

export async function throwKawadi(): Promise<ThrowKawadiResponse> {

	// Frontend-only placeholder. Replace with server-authoritative result.
	await pause(450)

	const shellFaces: ShellFace[] = Array.from({ length: 4 }, () =>
		Math.random() > 0.5 ? "front" : "back"
	)

	let moveValue = shellFaces.filter((face) => face === "front").length

	if (moveValue === 0) {
		moveValue = 4
	}

	return {
		shellFaces,
		moveValue
	}

}
