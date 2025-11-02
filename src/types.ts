export interface AutoRefreshSettings {
	isRunning: boolean
	intervalType: 'random' | 'fixed'
	randomMin: number
	randomMax: number
	fixed: number
	limit: number
}

export interface KeywordGroup {
	id: string
	keywords: string[]
}

export interface KeywordsSettings {
	enabled: boolean
	groups: KeywordGroup[]
	soundItems: string[] | undefined
	selectedSoundItem: string | undefined
}

export interface AutoClickerSettings {
	enabled: boolean
	// xpath: string
	querySelector: string
	savedQuerySelectors: string[]
	numClicks: number
	delay: number
}

export interface ExtensionSettings {
	numRefreshCalled: number
	lastTab: string | undefined
	autoRefresh: AutoRefreshSettings
	keywords: KeywordsSettings
	autoClicker: AutoClickerSettings
}
