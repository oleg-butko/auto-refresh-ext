// chrome.action.setBadgeText({ text: badgeText })
// chrome.action.setBadgeBackgroundColor({ color: '#666' })
// chrome.action.setTitle({ title: '✔ ' + String(knownWordsCount) })
import { ExtensionSettings } from './types'
let g_intervalId = 0
let g_counter = 0

chrome.action.setBadgeBackgroundColor({ color: '#777' })

interface RefreshTimer {
	tabId: number
	timeoutId: number
}

const activeTimers = new Map<number, RefreshTimer>()

// common
//
const updateSettings = (newSettings: ExtensionSettings) => {
	chrome.storage.local.set({ settings: newSettings })
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
	// const [tab] = await chrome.tabs.query({
	// 	active: true,
	// 	currentWindow: true
	// })
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
		await chrome.tabs.update(tabId, { active: true })
		await chrome.windows.update(foundByTabId.windowId, { focused: true })
	}, 5000)
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

function scheduleRefresh(tabId: number, settings: ExtensionSettings) {
	clearRefreshTimer(tabId)
	clearInterval(g_intervalId)
	const { numRefreshCalled } = settings
	const { intervalType, randomMin, randomMax, fixed, limit } =
		settings.autoRefresh
	let interval: number
	if (intervalType === 'random') {
		interval = getRandomInterval(randomMin, randomMax)
	} else {
		interval = fixed * 1000
	}
	g_counter = parseInt((interval / 1000).toFixed(0))
	console.log(`limit ${limit} numRefreshCalled ${numRefreshCalled}`)
	chrome.action.setBadgeText({
		text: `${g_counter}`
		// text: `${g_counter} _ ${numRefreshCalled}`
	})

	if (limit && numRefreshCalled && numRefreshCalled >= limit) {
		chrome.storage.local.get('settings', (result) => {
			if (result.settings) {
				console.log(
					'numRefreshCalled >= limit -> updateSettings -> isRunning: false'
				)
				updateSettings({
					...result.settings,
					autoRefresh: {
						...result.settings.autoRefresh,
						isRunning: false
					}
				})
			}
		})
		// stop refreshing
		// const newSettings = {
		// 	...settings,
		// 	autoRefresh: {
		// 		...settings.autoRefresh,
		// 		isRunning: false
		// 	}
		// }
		// updateSettings(newSettings)
	} else {
		//
		// update badge
		//
		g_intervalId = setInterval(async () => {
			g_counter--
			if (g_counter < 0) {
				clearInterval(g_intervalId)
				return
			}
			console.log('setBadgeText', g_counter)
			if (numRefreshCalled > 0) {
				// debugger
			}
			chrome.action.setBadgeText({
				text: `${g_counter}`
				// text: `${g_counter} _ ${numRefreshCalled}`
			})
		}, 1000)
		//
		// set reload timer
		//
		const timeoutId = setTimeout(async () => {
			try {
				settings.numRefreshCalled += 1
				updateSettings(settings)
				await chrome.tabs.reload(tabId)
			} catch (error) {
				console.error('Error refreshing tab:', error)
				clearRefreshTimer(tabId)
			}
		}, interval)
		activeTimers.set(tabId, {
			tabId,
			timeoutId: timeoutId as unknown as number
		})
	}
} // scheduleRefresh

function clearRefreshTimer(tabId: number) {
	const timer = activeTimers.get(tabId)
	if (timer) {
		clearTimeout(timer.timeoutId)
		activeTimers.delete(tabId)
	}
}

// function continueRefresh(settings: ExtensionSettings) {
// }

// chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
chrome.runtime.onMessage.addListener((message) => {
	console.log('message', message.action)
	chrome.action.setTitle({ title: 'Auto refresh' })
	if (message.action === 'start') {
		clearInterval(g_intervalId)
		//
		chrome.action.setIcon({
			path: { 128: chrome.runtime.getURL('onstart.png') }
		})
		//
		scheduleRefresh(message.tabId, message.settings)
		// } else if (message.action === 'continue') {
		// 	clearInterval(g_intervalId)
		// 	scheduleRefresh(message.tabId, message.settings)
	} else if (message.action === 'stop') {
		chrome.action.setTitle({ title: 'Auto refresh stopped' })
		clearInterval(g_intervalId)
		clearRefreshTimer(message.tabId)
		chrome.action.setIcon({
			path: { 128: chrome.runtime.getURL('icon.png') }
		})
	} else if (message.action === 'setBadgeText') {
		chrome.action.setBadgeText({ text: message.text })
	} else if (message.action === 'test') {
		// test()
	} else if (message.action === 'keywords-found') {
		setTimeout(() => {
			bringForward(message.tabId)
		}, 1000)
		showNoti(message.foundKeywords)
		console.log('Keywords found on the page')
		chrome.action.setTitle({ title: '✔ found' })
		chrome.action.setIcon({
			path: { 128: chrome.runtime.getURL('icon.png') }
		})
		chrome.storage.local.get('settings', (result) => {
			if (result.settings) {
				setTimeout(() => {
					playNotiSound(result.settings.keywords.selectedSoundItem)
				}, 500)
				console.log('found -> updateSettings -> isRunning: false')
				updateSettings({
					...result.settings,
					autoRefresh: {
						...result.settings.autoRefresh,
						isRunning: false
					}
				})
			}
		})
		clearRefreshTimer(message.tabId)
		clearInterval(g_intervalId)
		chrome.action.setBadgeText({ text: `found` })
	}
}) // onMessage

chrome.tabs.onRemoved.addListener((tabId) => {
	clearRefreshTimer(tabId)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === 'complete') {
		chrome.storage.local.get('settings', (result) => {
			if (result.settings && result.settings.autoRefresh.isRunning) {
				// debugger
				const timer = activeTimers.get(tabId)
				if (timer) {
					scheduleRefresh(tabId, result.settings)
					// chrome.runtime
					// 	.sendMessage({
					// 		action: 'continue',
					// 		settings: result.settings,
					// 		tabId
					// 	})
					// 	.catch((error) => {
					// 		console.error('catch in sending continue', error)
					// 	})
				}
			}
		})

		// console.log('Tab complete')
		let sendingCheckKeywordsAndClickCounter = 0
		const sendingCheckKeywordsAndClickIntervalId = setInterval(() => {
			console.log(
				'Tab: setInterval:',
				sendingCheckKeywordsAndClickCounter
			)
			if (sendingCheckKeywordsAndClickCounter++ > 4) {
				clearInterval(sendingCheckKeywordsAndClickIntervalId)
			}
			chrome.storage.local.get('settings', (result) => {
				if (result.settings && result.settings.autoRefresh.isRunning) {
					const timer = activeTimers.get(tabId)
					if (
						timer &&
						(result.settings.keywords.enabled ||
							result.settings.autoClicker.enabled)
					) {
						console.log('Tab: sending checkKeywordsAndClick')
						chrome.tabs
							.sendMessage(tabId, {
								action: 'checkKeywordsAndClick',
								keywords: result.settings.keywords,
								autoClicker: result.settings.autoClicker,
								tabId
							})
							.then((response) => {
								console.log(
									'checkKeywordsAndClick response',
									response
								)
								// if (response) {
								// }
							})
							.catch((error) => {
								console.error(
									'catch in sending checkKeywordsAndClick',
									error
								)
							})
					} // if timer ...
				} // if ... isRunning
			}) // storage.local.get('settings')
		}, 1000) // setInterval
	}
}) // tab onUpdated

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

// setTimeout(async () => {
// 	console.log('playAudio')
// 	await playAudio(chrome.runtime.getURL('notification.mp3'))
// 	// await playAudio('https://download.samplelib.com/mp3/sample-3s.mp3')
// }, 1000)
