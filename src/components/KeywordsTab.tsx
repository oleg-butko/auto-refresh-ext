import {
	Button,
	Stack,
	Switch,
	TagsInput,
	Group,
	ActionIcon
} from '@mantine/core'
import { Plus, Trash2 } from 'lucide-react'
import { KeywordsSettings, KeywordGroup } from '../types'
import { SoundDropdown } from './SoundDropdown'

interface KeywordsTabProps {
	settings: KeywordsSettings
	onSettingsChange: (settings: KeywordsSettings) => void
}

export function KeywordsTab({ settings, onSettingsChange }: KeywordsTabProps) {
	const addGroup = () => {
		const newGroup: KeywordGroup = {
			id: crypto.randomUUID(),
			keywords: []
		}
		onSettingsChange({
			...settings,
			groups: [...settings.groups, newGroup]
		})
	}

	const removeGroup = (id: string) => {
		onSettingsChange({
			...settings,
			groups: settings.groups.filter((group) => group.id !== id)
		})
	}

	const updateGroup = (id: string, keywords: string[]) => {
		onSettingsChange({
			...settings,
			groups: settings.groups.map((group) =>
				group.id === id ? { ...group, keywords } : group
			)
		})
	}

	return (
		<Stack gap='md'>
			<Switch
				label='Enable Keyword Detection'
				checked={settings.enabled}
				onChange={(event) =>
					onSettingsChange({
						...settings,
						enabled: event.currentTarget.checked
					})
				}
			/>
			<SoundDropdown
				settings={settings}
				onSettingsChange={onSettingsChange}
			/>

			{settings.groups.map((group, index) => (
				<Group key={group.id} align='flex-start' gap='xs'>
					<TagsInput
						label={`Keyword Group ${index + 1}`}
						placeholder='Enter keywords'
						value={group.keywords}
						onChange={(value) => updateGroup(group.id, value)}
						style={{ flex: 1 }}
						disabled={!settings.enabled}
					/>
					<ActionIcon
						color='red'
						variant='light'
						onClick={() => removeGroup(group.id)}
						disabled={
							!settings.enabled || settings.groups.length === 1
						}
						style={{ marginTop: 28 }}>
						<Trash2 size={16} />
					</ActionIcon>
				</Group>
			))}

			<Button
				leftSection={<Plus size={16} />}
				onClick={addGroup}
				variant='light'
				disabled={!settings.enabled}>
				Add Keyword Group
			</Button>
		</Stack>
	)
}
