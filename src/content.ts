console.log('content script loaded')
//
type KeywordsGroup = {
	id: string
	keywords: string[]
}
//
function searchKeywords(groups: KeywordsGroup[]): string[] {
	// let found = false
	const foundKeywords: string[] = []
	const pageText = document.body.innerText.toLowerCase()
	for (const group of groups) {
		if (group.keywords.length === 0) continue
		const groupMatches = group.keywords.filter((keyword: string) => {
			if (keyword === 'synth melody') {
				// debugger
			}
			if (pageText.includes(keyword.toLowerCase())) {
				// debugger
				foundKeywords.push(keyword)
				return true
			}
			return false
		})
		if (groupMatches.length > 0) {
			// debugger
			// found = true
			break
		}
	}
	return foundKeywords
}

// function clickElement(xpath: string, querySelector: string): boolean {
function clickElement(querySelector: string): boolean {
	let element: HTMLElement | null = null
	// if (xpath) {
	// 	try {
	// 		const result = document.evaluate(
	// 			xpath,
	// 			document,
	// 			null,
	// 			XPathResult.FIRST_ORDERED_NODE_TYPE,
	// 			null
	// 		)
	// 		element = result.singleNodeValue as HTMLElement
	// 	} catch (error) {
	// 		console.error('XPath error:', error)
	// 	}
	// }
	if (!element && querySelector) {
		try {
			element = document.querySelector(querySelector) as HTMLElement
		} catch (error) {
			console.error('querySelector error:', error)
		}
	}
	if (element) {
		element.click()
		return true
	}
	return false
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	sender?.id // eslint-disable-line @typescript-eslint/no-unused-expressions
	// const s = JSON.stringify(sender)
	// console.log(`autorefresh, sender: ${s}  m: ${JSON.stringify(message)}`)
	if (message.action === 'checkKeywordsAndClick') {
		if (message.keywords.enabled && message.keywords.groups.length > 0) {
			// debugger
			const foundKeywords = searchKeywords(message.keywords.groups)
			if (foundKeywords.length) {
				console.log(`found: ${foundKeywords}`)
				chrome.runtime.sendMessage({
					action: 'keywords-found',
					foundKeywords,
					tabId: message.tabId
				})
				if (message.autoClicker.enabled) {
					let clickCounter = 1
					// console.log(`autoClicker: ${message.autoClicker.xpath}`)
					console.log(
						`autoClicker: ${message.autoClicker.querySelector}`
					)
					const clicked = clickElement(
						// message.autoClicker.xpath,
						message.autoClicker.querySelector
					)
					// console.log(`clicked: ${clicked}`)
					if (clicked) {
						chrome.runtime.sendMessage({
							action: 'setBadgeText',
							text: `cl-${clickCounter}`
						})
						const intervalId = setInterval(() => {
							const clicked = clickElement(
								message.autoClicker.querySelector
							)
							if (clicked) {
								clickCounter++
								chrome.runtime.sendMessage({
									action: 'setBadgeText',
									text: `cl-${clickCounter}`
								})
								if (
									clickCounter >=
									message.autoClicker.numClicks
								) {
									clearInterval(intervalId)
								}
							} else {
								clearInterval(intervalId)
							}
						}, message.autoClicker.delay)
					} else {
						chrome.runtime.sendMessage({
							action: 'setBadgeText',
							text: `cl-0`
						})
					}
					if (!clicked && message.autoClicker.querySelector) {
						console.log('Auto clicker: Element not found')
					}
				} // if message.autoClicker.enabled
			} // if found
		} // if message.keywords.enabled ...
		sendResponse({ error: false })
	} else {
		sendResponse({ error: true, message: 'Unknown message.action' })
	} // if checkKeywordsAndClick
	return true
})
