import { useState, useEffect } from 'react'
import { MantineProvider, Tabs, Container } from '@mantine/core'
import { AutoRefreshTab } from './components/AutoRefreshTab'
import { KeywordsTab } from './components/KeywordsTab'
import { AutoClickerTab } from './components/AutoClickerTab'
import { ExtensionSettings } from './types'
import '@mantine/core/styles.css'

const defaultSettings: ExtensionSettings = {
	numRefreshCalled: 0,
	lastTab: 'refresh',
	autoRefresh: {
		isRunning: false,
		intervalType: 'random',
		randomMin: 5,
		randomMax: 10,
		limit: 2,
		fixed: 5
	},
	keywords: {
		enabled: false,
		groups: [{ id: crypto.randomUUID(), keywords: [] }],
		soundItems: ['None', 'Default'],
		selectedSoundItem: 'None'
	},
	autoClicker: {
		numClicks: 10,
		delay: 1000,
		enabled: false,
		querySelector: '',
		savedQuerySelectors: []
	}
}
const settingsMigration = (settings: ExtensionSettings) => {
	if (settings.keywords) {
		if (typeof settings.keywords.soundItems === 'undefined') {
			settings.keywords.soundItems = defaultSettings.keywords.soundItems
		}
		if (typeof settings.keywords.selectedSoundItem === 'undefined') {
			settings.keywords.selectedSoundItem =
				defaultSettings.keywords.selectedSoundItem
		}
	}
	return settings
}

function App() {
	const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings)
	const [curTab, setCurTab] = useState<string>('refresh')

	useEffect(() => {
		chrome.storage.local.get('settings', (result) => {
			// debugger
			if (result.settings) {
				setSettings(settingsMigration(result.settings))
			}
		})
	}, [])

	useEffect(() => {
		if (settings.lastTab) {
			setCurTab(settings.lastTab)
		}
	}, [curTab, settings.lastTab])

	const updateSettings = (newSettings: ExtensionSettings) => {
		setSettings(newSettings)
		chrome.storage.local.set({ settings: newSettings })
	}

	const handleToggleStart = async () => {
		const newSettings = {
			...settings,
			numRefreshCalled: 0,
			autoRefresh: {
				...settings.autoRefresh,
				isRunning: !settings.autoRefresh.isRunning
			}
		}
		updateSettings(newSettings)

		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true
		})
		if (tab.id) {
			chrome.runtime.sendMessage({
				action: newSettings.autoRefresh.isRunning ? 'start' : 'stop',
				tabId: tab.id,
				settings: newSettings
			})
		}
	}

	return (
		<MantineProvider>
			<Container size='sm' p='md' style={{ width: 400 }}>
				<Tabs
					value={curTab}
					onChange={(value) => {
						if (value) {
							updateSettings({ ...settings, lastTab: value })
						}
					}}>
					<Tabs.List>
						<Tabs.Tab value='refresh'>Auto Refresh</Tabs.Tab>
						<Tabs.Tab value='keywords'>Keywords</Tabs.Tab>
						<Tabs.Tab value='clicker'>Auto Clicker</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='refresh' pt='md'>
						<AutoRefreshTab
							settings={settings.autoRefresh}
							onSettingsChange={(autoRefresh) =>
								updateSettings({ ...settings, autoRefresh })
							}
							onToggleStart={handleToggleStart}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='keywords' pt='md'>
						<KeywordsTab
							settings={settings.keywords}
							onSettingsChange={(keywords) =>
								updateSettings({ ...settings, keywords })
							}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='clicker' pt='md'>
						<AutoClickerTab
							settings={settings.autoClicker}
							onSettingsChange={(autoClicker) =>
								updateSettings({ ...settings, autoClicker })
							}
						/>
					</Tabs.Panel>
				</Tabs>
			</Container>
		</MantineProvider>
	)
}

export default App
