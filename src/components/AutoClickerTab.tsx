import { Stack, Switch } from '@mantine/core' // TextInput
import { NumberInput, Group, Text } from '@mantine/core'
import { AutoClickerSettings } from '../types'
import { CompactSelectorsList } from './CompactSelectorsList'

interface AutoClickerTabProps {
	settings: AutoClickerSettings
	onSettingsChange: (settings: AutoClickerSettings) => void
}

export function AutoClickerTab({
	settings,
	onSettingsChange
}: AutoClickerTabProps) {
	return (
		<Stack gap='md'>
			<Switch
				label='Enable Auto Clicker'
				checked={settings.enabled}
				onChange={(event) =>
					onSettingsChange({
						...settings,
						enabled: event.currentTarget.checked
					})
				}
			/>

			<Stack gap='xs'>
				<Group grow>
					<Text size='sm'>Pause Between Clicks (ms)</Text>
					<NumberInput
						allowNegative={false}
						maw={90}
						value={settings.delay}
						onChange={(value) =>
							onSettingsChange({
								...settings,
								delay: Number(value)
							})
						}
						disabled={!settings.enabled}
					/>
				</Group>
			</Stack>

			<Stack gap='xs'>
				<Group grow>
					<Text size='sm'>Number of Clicks</Text>
					<NumberInput
						allowNegative={false}
						maw={90}
						value={settings.numClicks}
						onChange={(value) =>
							onSettingsChange({
								...settings,
								numClicks: Number(value)
							})
						}
						disabled={!settings.enabled}
					/>
				</Group>
			</Stack>

			<CompactSelectorsList
				settings={settings}
				onSettingsChange={onSettingsChange}
			/>
		</Stack>
	)
}
