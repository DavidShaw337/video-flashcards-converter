import React from 'react'
import { Form } from 'react-bootstrap'

// Define the type for the language options
interface LanguageOption {
    value: string
    label: string
}

// Define props for LanguageSelector component
interface LanguageSelectorProps {
    value: string
    onChange: (selectedOption: string) => void
    label?: string
    id?: string
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, label = "Select Language" }) => {
    // List of languages (You can add more languages or pull from an API)
    const options: LanguageOption[] = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'it', label: 'Italian' },
        { value: 'pt', label: 'Portuguese' },
        { value: 'zh', label: 'Chinese' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'ru', label: 'Russian' },
        { value: 'ar', label: 'Arabic' },
        // Add more languages as needed
    ]

    return (
        <Form.Group className="mb-3">
            <Form.Label>{label}</Form.Label>
            <Form.Select value={value} onChange={event => onChange(event.target.value)}>
                {options.map((language) => (
                    <option key={language.value} value={language.value}>
                        {language.label}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    )
}

export default LanguageSelector
