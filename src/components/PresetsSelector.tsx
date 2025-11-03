import { useState, useEffect } from 'react'
import { Select } from '@mantine/core'

interface PresetsSelectorProps {
	value: string
	onChange: (value: string) => void
}

const defaultPresetOptions = [
	{ value: 'none', label: 'None' },
	{ value: 'preset_1', label: 'Preset 1' },
	{ value: 'preset_2', label: 'Preset 2' },
	{ value: 'preset_3', label: 'Preset 3' },
	{ value: 'preset_4', label: 'Preset 4' },
	{ value: 'preset_5', label: 'Preset 5' },
	{ value: 'preset_6', label: 'Preset 6' }
]

export function PresetsSelector({ value, onChange }: PresetsSelectorProps) {
	const [presetOptions, setPresetOptions] = useState(defaultPresetOptions)
	useEffect(() => {
		chrome.storage.local.get(['presets_labels'], (result) => {
			if (result.presets_labels) {
				setPresetOptions(result.presets_labels)
			} else {
				chrome.storage.local.set({
					presets_labels: defaultPresetOptions
				})
			}
		})
	}, [presetOptions])

	return (
		<Select
			// label='Active Preset'
			// height={320}
			placeholder='Select a preset'
			comboboxProps={{ size: 'xs', dropdownPadding: '2' }}
			data={presetOptions}
			value={value}
			onChange={(val) => val && onChange(val)}
			allowDeselect={false}
		/>
	)
}
