import { AutoClickerSettings } from '../types'
import { Dropdown } from './Dropdown'

interface SelectorsListProps {
	maxHeight?: number
	settings: AutoClickerSettings
	onSettingsChange: (settings: AutoClickerSettings) => void
}

export function CompactSelectorsList({
	settings,
	onSettingsChange,
	maxHeight = 200
}: SelectorsListProps) {
	const arrValues = settings.savedQuerySelectors
	const onChangeSelected = (value: string) => {
		console.log('onChangeSelected', value)
		onSettingsChange({
			...settings,
			querySelector: value
		})
	}
	const onNewValue = (newValue: string) => {
		console.log('onNewValue', newValue)
		if (
			newValue.trim() &&
			!settings.savedQuerySelectors.includes(newValue.trim())
		) {
			onSettingsChange({
				...settings,
				savedQuerySelectors: settings.savedQuerySelectors.concat(
					newValue.trim()
				)
			})
			return true
		}
		return false
	}
	return (
		<Dropdown
			label={'Button Selector'}
			placeholder={'Enter button selector and click +'}
			value={settings.querySelector}
			arrValues={arrValues}
			onNewValue={onNewValue}
			onChangeSelected={onChangeSelected}
			disabled={!settings.enabled}
			maxHeight={maxHeight}></Dropdown>
	)
}
