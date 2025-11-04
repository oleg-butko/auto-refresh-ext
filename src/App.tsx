import { useState, useEffect } from 'react'
import { MantineProvider, Tabs, Container, Stack } from '@mantine/core'
import { AutoRefreshTab } from './components/AutoRefreshTab'
import { KeywordsTab } from './components/KeywordsTab'
import { AutoClickerTab } from './components/AutoClickerTab'
import { PresetsSelector } from './components/PresetsSelector'
import { ExtensionSettings, GlobalSettings, PresetSettings } from './types'
import '@mantine/core/styles.css'

const createDefaultSettings = (presetId: string): PresetSettings => ({
	presetId,
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
})

const createDefaultGlobalSettings = (): GlobalSettings => ({
	presets: {
		preset_1: createDefaultSettings('preset_1'),
		preset_2: createDefaultSettings('preset_2'),
		preset_3: createDefaultSettings('preset_3'),
		preset_4: createDefaultSettings('preset_4'),
		preset_5: createDefaultSettings('preset_5'),
		preset_6: createDefaultSettings('preset_6')
	},
	tabPresetMapping: {}
})
const settingsMigration = (
	settings: PresetSettings,
	presetId: string
): PresetSettings => {
	const defaultPreset = createDefaultSettings(presetId)
	if (settings.keywords) {
		if (typeof settings.keywords.soundItems === 'undefined') {
			settings.keywords.soundItems = defaultPreset.keywords.soundItems
		}
		if (typeof settings.keywords.selectedSoundItem === 'undefined') {
			settings.keywords.selectedSoundItem =
				defaultPreset.keywords.selectedSoundItem
		}
	}
	if (!settings.presetId) {
		settings.presetId = presetId
	}
	return settings
}

const migrateOldSettings = (oldSettings: ExtensionSettings): GlobalSettings => {
	const globalSettings = createDefaultGlobalSettings()
	const migratedPreset = {
		...oldSettings,
		presetId: 'preset_1'
	} as PresetSettings
	globalSettings.presets.preset_1 = settingsMigration(
		migratedPreset,
		'preset_1'
	)
	return globalSettings
}

function App() {
	const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(
		createDefaultGlobalSettings()
	)
	const [currentTabId, setCurrentTabId] = useState<number>(0)
	const [currentPresetId, setCurrentPresetId] = useState<string>('none') // preset_1
	const [settings, setSettings] = useState<PresetSettings>(
		createDefaultSettings('preset_1')
	)
	const [curTab, setCurTab] = useState<string>('refresh')

	useEffect(() => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.id) {
				setCurrentTabId(tabs[0].id)
			}
		})
	}, [])

	useEffect(() => {
		chrome.storage.local.get(['globalSettings', 'settings'], (result) => {
			let loadedGlobalSettings: GlobalSettings
			if (result.globalSettings) {
				loadedGlobalSettings = result.globalSettings
			} else if (result.settings) {
				loadedGlobalSettings = migrateOldSettings(result.settings)
				chrome.storage.local.set({
					globalSettings: loadedGlobalSettings
				})
				chrome.storage.local.remove('settings')
			} else {
				loadedGlobalSettings = createDefaultGlobalSettings()
			}

			setGlobalSettings(loadedGlobalSettings)

			if (currentTabId) {
				const presetId =
					loadedGlobalSettings.tabPresetMapping[currentTabId] ||
					'none'
				// 'preset_1'
				setCurrentPresetId(presetId)
				const preset = loadedGlobalSettings.presets[presetId]
				if (preset) {
					setSettings(preset)
				}
			}
		})
	}, [currentTabId])

	useEffect(() => {
		if (settings.lastTab) {
			setCurTab(settings.lastTab)
		}
	}, [curTab, settings.lastTab])

	const updateSettings = (newSettings: PresetSettings) => {
		setSettings(newSettings)
		const updatedGlobalSettings = {
			...globalSettings,
			presets: {
				...globalSettings.presets,
				[currentPresetId]: newSettings
			}
		}
		setGlobalSettings(updatedGlobalSettings)
		chrome.storage.local.set({ globalSettings: updatedGlobalSettings })
	}

	const handlePresetChange = async (presetId: string) => {
		// globalSettings.tabPresetMapping: {
		//     [currentTabId]: presetId
		// const tabIds = Object.keys(globalSettings.tabPresetMapping)
		// const presets = Object.values(globalSettings.tabPresetMapping)
		let foundTabIdInSettings = 0
		if (presetId !== 'none') {
			const tab2presets = Object.entries(globalSettings.tabPresetMapping)
			for (const arr of tab2presets) {
				if (arr[1] === presetId) {
					foundTabIdInSettings = parseInt(arr[0], 10)
					break
				}
			}
		}
		if (foundTabIdInSettings) {
			const tabs = await chrome.tabs.query({})
			// console.log('tabs', tabs)
			const foundInExistingTabs = tabs.filter((tabitem) => {
				if (tabitem.id == foundTabIdInSettings) {
					debugger
					return true
				}
			})[0]

			if (foundInExistingTabs && foundInExistingTabs.id) {
				chrome.runtime.sendMessage({
					action: 'preset-already-choosen',
					tabId: currentTabId,
					foundTabId: foundInExistingTabs.id
				})
				return
			} else {
				debugger
			}
		}
		setCurrentPresetId(presetId)
		const newPreset = globalSettings.presets[presetId]
		setSettings(newPreset)
		const updatedGlobalSettings = {
			...globalSettings,
			tabPresetMapping: {
				...globalSettings.tabPresetMapping,
				[currentTabId]: presetId
			}
		}
		setGlobalSettings(updatedGlobalSettings)
		chrome.storage.local.set({ globalSettings: updatedGlobalSettings })

		chrome.runtime.sendMessage({
			action: 'preset-changed',
			tabId: currentTabId,
			presetId
		})
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
			<Container size='sm' p='md' mih={300} style={{ width: 400 }}>
				<Stack gap='md'>
					<PresetsSelector
						value={currentPresetId}
						onChange={handlePresetChange}
					/>
					{currentPresetId !== 'none' && (
						<Tabs
							value={curTab}
							onChange={(value) => {
								if (value) {
									updateSettings({
										...settings,
										lastTab: value
									})
								}
							}}>
							<Tabs.List>
								<Tabs.Tab value='refresh'>
									Auto Refresh
								</Tabs.Tab>
								<Tabs.Tab value='keywords'>Keywords</Tabs.Tab>
								<Tabs.Tab value='clicker'>
									Auto Clicker
								</Tabs.Tab>
							</Tabs.List>

							<Tabs.Panel value='refresh' pt='md'>
								<AutoRefreshTab
									settings={settings.autoRefresh}
									onSettingsChange={(autoRefresh) =>
										updateSettings({
											...settings,
											autoRefresh
										})
									}
									onToggleStart={handleToggleStart}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='keywords' pt='md'>
								<KeywordsTab
									settings={settings.keywords}
									onSettingsChange={(keywords) =>
										updateSettings({
											...settings,
											keywords
										})
									}
								/>
							</Tabs.Panel>

							<Tabs.Panel value='clicker' pt='md'>
								<AutoClickerTab
									settings={settings.autoClicker}
									onSettingsChange={(autoClicker) =>
										updateSettings({
											...settings,
											autoClicker
										})
									}
								/>
							</Tabs.Panel>
						</Tabs>
					)}
				</Stack>
			</Container>
		</MantineProvider>
	)
}

export default App
