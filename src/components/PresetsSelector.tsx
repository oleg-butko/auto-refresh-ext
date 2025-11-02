import { Select } from '@mantine/core'

interface PresetsSelectorProps {
	value: string
	onChange: (value: string) => void
}

export function PresetsSelector({ value, onChange }: PresetsSelectorProps) {
	const presetOptions = [
		{ value: 'preset_1', label: 'Preset 1' },
		{ value: 'preset_2', label: 'Preset 2' },
		{ value: 'preset_3', label: 'Preset 3' },
		{ value: 'preset_4', label: 'Preset 4' },
		{ value: 'preset_5', label: 'Preset 5' },
		{ value: 'preset_6', label: 'Preset 6' }
	]

	return (
		<Select
			label='Active Preset'
			placeholder='Select a preset'
			data={presetOptions}
			value={value}
			onChange={(val) => val && onChange(val)}
			allowDeselect={false}
		/>
	)
}
