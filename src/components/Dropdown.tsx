// useEffect
import { useEffect, useState } from 'react'
import {
	Combobox,
	TextInput,
	Button,
	Group,
	Stack,
	ScrollArea,
	Text,
	useCombobox,
	ActionIcon
} from '@mantine/core'
import { IconArrowBadgeDown, IconPlus, IconX } from '@tabler/icons-react'

interface DropdownProps {
	label: string
	placeholder: string
	value: string
	arrValues: string[]
	onNewValue: (val: string) => boolean
	onChangeSelected: (val: string) => void
	onRemoveValue?: (val: string) => void
	disabled?: boolean
	maxHeight?: number
}

export function Dropdown({
	label,
	placeholder,
	value,
	arrValues,
	onNewValue,
	onChangeSelected,
	onRemoveValue,
	disabled,
	maxHeight = 200
}: DropdownProps) {
	const [inputValue, setInputValue] = useState(value)
	const [opened, setOpened] = useState(false)
	const [disabledComboBox, setDisabledComboBox] = useState(disabled)
	const combobox = useCombobox({ opened })
	//
	// console.log('Dropdown disabled', disabled)
	const handleAddItem = () => {
		if (inputValue.trim() && !arrValues.includes(inputValue.trim())) {
			if (onNewValue(inputValue.trim())) {
				setInputValue('')
			}
		}
	}
	//
	useEffect(() => {
		setInputValue(value)
	}, [value])
	//
	useEffect(() => {
		setDisabledComboBox(disabled)
	}, [disabled])
	//
	const handleRemoveItem = (itemToRemove: string, e: React.MouseEvent) => {
		e.stopPropagation()
		if (onRemoveValue) {
			onRemoveValue(itemToRemove)
			if (inputValue === itemToRemove) {
				setInputValue('')
			}
		}
	}

	const options = arrValues.map((item, index) => (
		<Combobox.Option
			value={item}
			key={index}
			selected={item === inputValue}>
			<Group justify='space-between'>
				<Text style={{ flex: 1 }}>{item}</Text>
				{onRemoveValue && (
					<ActionIcon
						size='xs'
						variant='subtle'
						color='red'
						onClick={(e) => handleRemoveItem(item, e)}>
						<IconX size={12} />
					</ActionIcon>
				)}
			</Group>
		</Combobox.Option>
	))
	//
	return (
		<Combobox
			store={combobox}
			disabled={disabledComboBox}
			onOptionSubmit={(value) => {
				console.log('onOptionSubmit', value)
				onChangeSelected(value)
				setInputValue(value)
				setOpened(false)
			}}>
			<Combobox.Target>
				<TextInput
					label={label}
					placeholder={placeholder}
					value={inputValue}
					onChange={(event) => {
						setInputValue(event.currentTarget.value)
					}}
					onBlur={() => setOpened(false)}
					leftSection={
						<Stack gap='xs'>
							<Button
								disabled={disabledComboBox}
								p={0}
								miw={30}
								w={30}
								size='xs'
								onClick={() => setOpened((o) => !o)}>
								<IconArrowBadgeDown size={14} />
							</Button>
						</Stack>
					}
					rightSection={
						// add item
						<Stack gap='xs'>
							<Button
								disabled={
									disabledComboBox || !inputValue.trim()
								}
								p={0}
								miw={30}
								w={30}
								size='xs'
								onClick={handleAddItem}>
								<IconPlus size={14} />
							</Button>
						</Stack>
					}
				/>
			</Combobox.Target>

			<Combobox.Dropdown style={{ backgroundColor: '#eee' }}>
				<Combobox.Options>
					<ScrollArea.Autosize mah={maxHeight}>
						{options.length > 0 ? (
							options
						) : (
							<Combobox.Empty>Empty list</Combobox.Empty>
						)}
					</ScrollArea.Autosize>
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	)
}
