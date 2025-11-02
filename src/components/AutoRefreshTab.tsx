import { Button, NumberInput, Radio, Stack, Group, Text } from '@mantine/core'
import { AutoRefreshSettings } from '../types'
import { useEffect, useState } from 'react'

interface AutoRefreshTabProps {
	settings: AutoRefreshSettings
	onSettingsChange: (settings: AutoRefreshSettings) => void
	onToggleStart: () => void
}
// async function onTest() {
// 	const [tab] = await chrome.tabs.query({
// 		active: true,
// 		currentWindow: true
// 	})
// 	if (tab.id) {
// 		chrome.runtime.sendMessage({
// 			action: 'test'
// 		})
// 	}
// }

export function AutoRefreshTab({
	settings,
	onSettingsChange,
	onToggleStart
}: AutoRefreshTabProps) {
	const [buttonText, setButtonText] = useState('')
	// console.log('settings.isRunning', settings.isRunning)
	useEffect(() => {
		setButtonText(settings.isRunning ? 'Stop' : 'Start')
	}, [settings.isRunning])

	return (
		<Stack gap='md'>
			{/* <Button maw={100} onClick={onTest}>
				Test
			</Button> */}

			<Button
				onClick={onToggleStart}
				color={settings.isRunning ? 'red' : 'blue'}
				fullWidth>
				{buttonText}
			</Button>

			<Stack gap='xs'>
				<Group grow>
					<Text size='sm'>
						Limit number of refreshes (0 - no limit)
					</Text>
					<NumberInput
						maw={70}
						value={settings.limit}
						onChange={(value) =>
							onSettingsChange({
								...settings,
								limit: Number(value)
							})
						}
						disabled={false}
					/>
				</Group>
			</Stack>

			<Radio.Group
				value={settings.intervalType}
				onChange={(value) =>
					onSettingsChange({
						...settings,
						intervalType: value as 'random' | 'fixed'
					})
				}>
				<Stack align='flex-start' gap='md' pb={'sm'} mt='xs'>
					{/* radio_group 1 */}
					<Group>
						<Radio value='random' label='Random' />
						<Text size='sm' fw={50}>
							from
						</Text>

						<NumberInput
							maw={70}
							m={0}
							p={0}
							value={settings.randomMin}
							onChange={(value) =>
								onSettingsChange({
									...settings,
									randomMin: Number(value)
								})
							}
							min={1}
							disabled={settings.intervalType !== 'random'}
						/>

						<Text size='sm' fw={50}>
							to
						</Text>

						<NumberInput
							maw={70}
							value={settings.randomMax}
							onChange={(value) =>
								onSettingsChange({
									...settings,
									randomMax: Number(value)
								})
							}
							min={1}
							disabled={settings.intervalType !== 'random'}
						/>
					</Group>
					{/* radio_group 2 */}
					<Stack
						align='flex-start'
						gap='md'
						pt={'md'}
						pb={'sm'}
						mt={0}>
						<Group>
							<Radio value='fixed' label='Fixed Interval' />
							<NumberInput
								maw={70}
								value={settings.fixed}
								onChange={(value) =>
									onSettingsChange({
										...settings,
										fixed: Number(value)
									})
								}
								min={1}
								disabled={settings.intervalType !== 'fixed'}
							/>
							<Text size='sm'>seconds</Text>
						</Group>
					</Stack>
				</Stack>
			</Radio.Group>
		</Stack>
	)
}
