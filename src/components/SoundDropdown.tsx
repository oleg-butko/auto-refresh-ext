// import { AutoClickerSettings } from '../types'
import { KeywordsSettings } from '../types'
import { Dropdown } from './Dropdown'

interface SoundDropdownProps {
	settings: KeywordsSettings
	onSettingsChange: (settings: KeywordsSettings) => void
}

export function SoundDropdown({
	settings,
	onSettingsChange
}: SoundDropdownProps) {
	const arrValues = settings.soundItems ?? []
	const onChangeSelected = (value: string) => {
		console.log('onChangeSelected', value)
		onSettingsChange({
			...settings,
			selectedSoundItem: value
		})
	}
	const onNewValue = (newValue: string) => {
		console.log('onNewValue', newValue)
		if (!settings.soundItems) {
			const msg = 'Unexpected: soundItems is undefined (migration error?)'
			console.error(msg)
			return false
		}
		if (newValue.trim() && !settings.soundItems.includes(newValue.trim())) {
			onSettingsChange({
				...settings,
				soundItems: settings.soundItems.concat(newValue.trim())
			})
			return true
		}
		return false
	}
	return (
		<Dropdown
			label={'Notification sound'}
			placeholder={'Paste a URL to a sound file and click +'}
			value={settings.selectedSoundItem ?? ''}
			arrValues={arrValues}
			onNewValue={onNewValue}
			onChangeSelected={onChangeSelected}
			disabled={!settings.enabled}
			maxHeight={200}></Dropdown>
	)
}
