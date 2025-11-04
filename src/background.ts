import { PresetSettings, GlobalSettings } from './types'

interface TabTimerData {
	intervalId: number
	counter: number
	presetId: string
}

const tabTimerData = new Map<number, TabTimerData>()

chrome.action.setBadgeBackgroundColor({ color: '#555' })
chrome.action.setTitle({ title: 'Auto refresh' })

interface RefreshTimer {
	tabId: number
	timeoutId: number
	presetId: string
}

const activeTimers = new Map<number, RefreshTimer>()

// common
//
const updatePresetInGlobalSettings = (
	presetId: string,
	newSettings: PresetSettings
) => {
	chrome.storage.local.get('globalSettings', (result) => {
		if (result.globalSettings) {
			const updatedGlobalSettings: GlobalSettings = {
				...result.globalSettings,
				presets: {
					...result.globalSettings.presets,
					[presetId]: newSettings
				}
			}
			chrome.storage.local.set({ globalSettings: updatedGlobalSettings })
		}
	})
}
//
// end of common
// TODO
const showNotifications = true
//
const showNoti = (foundKeywords: string[]) => {
	if (showNotifications) {
		chrome.notifications.create({
			type: 'basic',
			iconUrl: 'icon.png',
			title: 'Auto refresh - Found',
			message: 'Found keyword: ' + foundKeywords.join(', '),
			priority: 2
		})
	}
}
//
const bringForward = async (tabId: number) => {
	try {
		const tabs = await chrome.tabs.query({})
		console.log('tabs', tabs)
		const foundByTabId = tabs.filter((tabitem) => {
			// if (tabitem.id == tab.id) {
			if (tabitem.id == tabId) {
				return true
			}
		})[0]
		console.log('foundByTabId', foundByTabId)
		// console.log('tab', tab.id, tab.windowId)
		setTimeout(async () => {
			// await chrome.tabs.update(tab.id, { active: true })
			try {
				await chrome.tabs.update(tabId, { active: true })
				await chrome.windows.update(foundByTabId.windowId, {
					focused: true
				})
			} catch (error) {
				console.error('Error bringing tab to front(1):', error)
				debugger
			}
		}, 200)
	} catch (error) {
		console.error('Error bringing tab to front(2):', error)
		debugger
	}
}
/**
 * @param soundItem - None/Default/URL
 */
const playNotiSound = async (soundItem: string) => {
	console.log('playNotiSound', soundItem)
	if (soundItem === 'None') {
		//
	} else if (soundItem === 'Default') {
		await playAudio(chrome.runtime.getURL('notification.mp3'))
	} else {
		await playAudio(soundItem)
	}
}

function getRandomInterval(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min) * 1000
}

function scheduleRefresh(tabId: number, settings: PresetSettings) {
	clearRefreshTimer(tabId)
	const existingTimerData = tabTimerData.get(tabId)
	if (existingTimerData) {
		clearInterval(existingTimerData.intervalId)
	}
	const { numRefreshCalled } = settings
	const { intervalType, randomMin, randomMax, fixed, limit } =
		settings.autoRefresh
	let interval: number
	if (intervalType === 'random') {
		interval = getRandomInterval(randomMin, randomMax)
	} else {
		interval = fixed * 1000
	}
	const counter = parseInt((interval / 1000).toFixed(0))
	console.log(`limit ${limit} numRefreshCalled ${numRefreshCalled}`)

	tabTimerData.set(tabId, {
		intervalId: 0,
		counter,
		presetId: settings.presetId
	})

	updateBadgeForTab(tabId, 0)

	if (limit && numRefreshCalled && numRefreshCalled >= limit) {
		console.log(
			'numRefreshCalled >= limit -> updateSettings -> isRunning: false'
		)
		const updatedSettings = {
			...settings,
			autoRefresh: {
				...settings.autoRefresh,
				isRunning: false
			}
		}
		updatePresetInGlobalSettings(settings.presetId, updatedSettings)
	} else {
		const timerData = tabTimerData.get(tabId)
		if (!timerData) return

		const intervalId = setInterval(() => {
			const data = tabTimerData.get(tabId)
			if (!data) {
				clearInterval(intervalId)
				return
			}
			data.counter--
			if (data.counter < 0) {
				clearInterval(intervalId)
				return
			}
			tabTimerData.set(tabId, data)
			updateBadgeForTab(tabId, -1)
		}, 1000)

		timerData.intervalId = intervalId
		tabTimerData.set(tabId, timerData)

		const timeoutId = setTimeout(async () => {
			try {
				settings.numRefreshCalled += 1
				updatePresetInGlobalSettings(settings.presetId, settings)
				await chrome.tabs.reload(tabId)
			} catch (error) {
				console.error('Error refreshing tab:', error)
				clearRefreshTimer(tabId)
			}
		}, interval)
		activeTimers.set(tabId, {
			tabId,
			timeoutId: timeoutId as unknown as number,
			presetId: settings.presetId
		})
	}
} // scheduleRefresh

function clearRefreshTimer(tabId: number) {
	const timer = activeTimers.get(tabId)
	if (timer) {
		clearTimeout(timer.timeoutId)
		activeTimers.delete(tabId)
	}
	const timerData = tabTimerData.get(tabId)
	if (timerData) {
		clearInterval(timerData.intervalId)
		tabTimerData.delete(tabId)
	}
}

function updateBadgeForTab(tabId: number, foundPresetNum: number) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (foundPresetNum === 0) {
			chrome.action.setBadgeText({ text: '' })
			chrome.action.setIcon({
				path: { 128: chrome.runtime.getURL('icon.png') }
			})
			return
		}
		if (tabs[0]?.id === tabId) {
			const timerData = tabTimerData.get(tabId)
			if (!timerData) {
				// chrome.action.setBadgeText({ text: `${foundPresetNum}` })
				chrome.action.setBadgeText({ text: '' })
				return
			}
			// console.log(`timerData ${timerData.presetId}`)
			const nPreset = timerData.presetId.split('_')[1]
			console.log(`nPreset ${nPreset}`)
			if (timerData) {
				chrome.action.setBadgeText({
					text: `${timerData.counter}`
					// text: `${nPreset} ${timerData.counter}`
				})
			}
		}
	})
}

function getPresetForTab(
	tabId: number,
	globalSettings: GlobalSettings
): PresetSettings | null {
	const presetId = globalSettings.tabPresetMapping[tabId] || 'preset_1'
	return globalSettings.presets[presetId] || null
}

// function continueRefresh(settings: ExtensionSettings) {
// }

// chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
chrome.runtime.onMessage.addListener((message) => {
	console.log('message', message.action)
	if (message.action === 'start') {
		const timerData = tabTimerData.get(message.tabId)
		if (timerData) {
			clearInterval(timerData.intervalId)
		}
		chrome.action.setIcon({
			path: { 128: chrome.runtime.getURL('onstart.png') }
		})
		scheduleRefresh(message.tabId, message.settings)
	} else if (message.action === 'stop') {
		const timerData = tabTimerData.get(message.tabId)
		if (timerData) {
			clearInterval(timerData.intervalId)
			tabTimerData.delete(message.tabId)
		}
		clearRefreshTimer(message.tabId)
		chrome.action.setIcon({
			path: { 128: chrome.runtime.getURL('icon.png') }
		})
		chrome.action.setBadgeText({ text: '' })
	} else if (message.action === 'setBadgeText') {
		chrome.action.setBadgeText({ text: message.text })
	} else if (message.action === 'preset-already-choosen') {
		// tabId: currentTabId, foundTabId
		setTimeout(() => {
			bringForward(message.foundTabId)
		}, 100)
	} else if (message.action === 'preset-changed') {
		if (message.presetId === 'none') {
			updateBadgeForTab(message.tabId, 0)
		} else {
			const strPresetNum = message.presetId.split('_')[1]
			updateBadgeForTab(message.tabId, parseInt(strPresetNum, 10))
		}
		const timer = activeTimers.get(message.tabId)
		if (timer && timer.presetId !== message.presetId) {
			clearRefreshTimer(message.tabId)
			chrome.action.setIcon({
				path: { 128: chrome.runtime.getURL('icon.png') }
			})
			// chrome.action.setBadgeText({ text: '' })
		}
	} else if (message.action === 'test') {
		//
	} else if (message.action === 'keywords-found') {
		setTimeout(() => {
			bringForward(message.tabId)
		}, 2000)
		showNoti(message.foundKeywords)
		console.log('Keywords found on the page')
		chrome.action.setIcon({
			path: { 128: chrome.runtime.getURL('icon.png') }
		})
		chrome.storage.local.get('globalSettings', (result) => {
			if (result.globalSettings) {
				const preset = getPresetForTab(
					message.tabId,
					result.globalSettings
				)
				if (preset) {
					setTimeout(() => {
						playNotiSound(
							preset.keywords.selectedSoundItem || 'None'
						)
					}, 500)
					console.log('found -> updateSettings -> isRunning: false')
					const updatedPreset = {
						...preset,
						autoRefresh: {
							...preset.autoRefresh,
							isRunning: false
						}
					}
					updatePresetInGlobalSettings(preset.presetId, updatedPreset)
				}
			}
		})
		clearRefreshTimer(message.tabId)
		const timerData = tabTimerData.get(message.tabId)
		if (timerData) {
			clearInterval(timerData.intervalId)
			tabTimerData.delete(message.tabId)
		}
		chrome.action.setBadgeText({ text: `found` })
	}
}) // onMessage

chrome.tabs.onRemoved.addListener((tabId) => {
	clearRefreshTimer(tabId)
	chrome.storage.local.get('globalSettings', (result) => {
		if (result.globalSettings) {
			const updatedMapping = { ...result.globalSettings.tabPresetMapping }
			delete updatedMapping[tabId]
			const updatedGlobalSettings = {
				...result.globalSettings,
				tabPresetMapping: updatedMapping
			}
			chrome.storage.local.set({ globalSettings: updatedGlobalSettings })
		}
	})
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === 'complete') {
		chrome.storage.local.get('globalSettings', (result) => {
			if (result.globalSettings) {
				const preset = getPresetForTab(tabId, result.globalSettings)
				if (preset && preset.autoRefresh.isRunning) {
					const timer = activeTimers.get(tabId)
					if (timer) {
						scheduleRefresh(tabId, preset)
					}
				}
			}
		})

		// console.log('Tab complete')
		let sendingCheckKeywordsAndClickCounter = 0
		const sendingCheckKeywordsAndClickIntervalId = setInterval(() => {
			// console.log(
			// 	'Tab: setInterval:',
			// 	sendingCheckKeywordsAndClickCounter
			// )
			if (sendingCheckKeywordsAndClickCounter++ > 4) {
				clearInterval(sendingCheckKeywordsAndClickIntervalId)
			}
			chrome.storage.local.get('globalSettings', (result) => {
				if (result.globalSettings) {
					const preset = getPresetForTab(tabId, result.globalSettings)
					if (preset && preset.autoRefresh.isRunning) {
						const timer = activeTimers.get(tabId)
						if (
							timer &&
							(preset.keywords.enabled ||
								preset.autoClicker.enabled)
						) {
							console.log('Tab: sending checkKeywordsAndClick')
							chrome.tabs
								.sendMessage(tabId, {
									action: 'checkKeywordsAndClick',
									keywords: preset.keywords,
									autoClicker: preset.autoClicker,
									tabId
								})
								.then((response) => {
									console.log(
										'checkKeywordsAndClick response',
										response
									)
								})
								.catch((error) => {
									console.error(
										'catch in sending checkKeywordsAndClick',
										error
									)
								})
						}
					}
				}
			})
		}, 1000)
	}
})

const showCurrentPresetInBadge = (tabId: number) => {
	chrome.storage.local.get('globalSettings', (result) => {
		if (result.globalSettings) {
			const tab2presets = Object.entries(
				result.globalSettings.tabPresetMapping
			)
			let foundTabId = 0
			let foundPresetNum = 0
			let isRunning = false
			for (const arr of tab2presets) {
				if (arr[0] === `${tabId}`) {
					foundTabId = tabId
					const presetId = (arr as string[])[1]
					isRunning =
						result.globalSettings.presets[presetId].autoRefresh
							.isRunning
					const nPreset = presetId.split('_')[1]
					foundPresetNum = parseInt(nPreset, 10)
					break
				}
			}
			if (foundTabId) {
				updateBadgeForTab(tabId, foundPresetNum || 0)
				if (isRunning) {
					chrome.action.setIcon({
						path: { 128: chrome.runtime.getURL('onstart.png') }
					})
				}
			} else {
				chrome.action.setIcon({
					path: { 128: chrome.runtime.getURL('icon.png') }
				})
			}
		}
	})
}

let g_currentTabId = 0

setInterval(() => {
	if (g_currentTabId) {
		showCurrentPresetInBadge(g_currentTabId)
	}
}, 1000)

chrome.tabs.onActivated.addListener((activeInfo) => {
	// console.log(`tabs.onActivated: ${activeInfo.tabId}`)
	g_currentTabId = activeInfo.tabId
	showCurrentPresetInBadge(activeInfo.tabId)
	updateBadgeForTab(activeInfo.tabId, 0)
})

const checkOffscreenDocumentExist = async (offscreenUrl: string) => {
	if (chrome.runtime.getContexts) {
		const existingContexts = await chrome.runtime.getContexts({
			contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
			documentUrls: [offscreenUrl]
		})
		return existingContexts.length > 0
		// @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature
	} else if (globalThis.clients) {
		// @ts-expect-error Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature
		const matchedClients = await globalThis.clients.matchAll()
		for (const client of matchedClients) {
			if (client.url === offscreenUrl) {
				return true
			}
		}
		return false
	}
	return false
}

//
// https://developer.chrome.com/docs/extensions/reference/api/offscreen
//
let offscreenDoc: Promise<void> | null = null
//
const setupOffscreenDocument = async (path: string) => {
	if (await checkOffscreenDocumentExist(path)) {
		return
	}
	if (offscreenDoc) {
		await offscreenDoc
	} else {
		offscreenDoc = chrome.offscreen.createDocument({
			url: path,
			reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
			justification: 'play audio for word pronunciation'
		})
		await offscreenDoc
		offscreenDoc = null
	}
}

const playAudio = async (audio: string) => {
	const volume = 40
	await setupOffscreenDocument(chrome.runtime.getURL('audioPlayer.html'))
	chrome.runtime.sendMessage({
		type: 'play-audio',
		target: 'offscreen',
		data: { audio, volume }
	})
}

function clearTabsPresetMapping() {
	chrome.storage.local.get('globalSettings', (result) => {
		if (result.globalSettings) {
			if (result.globalSettings.presets) {
				for (const k of Object.keys(result.globalSettings.presets)) {
					const preset = result.globalSettings.presets[k]
					if (preset?.autoRefresh?.isRunning) {
						preset.autoRefresh.isRunning = false
						debugger
					}
				}
			}
			const updatedGlobalSettings: GlobalSettings = {
				...result.globalSettings,
				tabPresetMapping: {}
			}
			chrome.storage.local.set({
				globalSettings: updatedGlobalSettings
			})
		}
	})
}

chrome.runtime.onInstalled.addListener((details) => {
	console.log('onInstalled', JSON.stringify(details, null, 2))

	if (details.reason === 'update') {
		clearTabsPresetMapping()
	}
	if (details.reason === 'install') {
		// first install of new version
		debugger
	}
})

clearTabsPresetMapping()

// setTimeout(async () => {
// 	console.log('playAudio')
// 	await playAudio(chrome.runtime.getURL('notification.mp3'))
// 	// await playAudio('https://download.samplelib.com/mp3/sample-3s.mp3')
// }, 1000)
