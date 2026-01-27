import { useState } from 'react'
import { X, Plus } from 'lucide-react'

const TAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
]

function getTagColor(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export function Tag({ tag, onRemove, size = 'sm' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${getTagColor(tag)}`}>
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(tag)}
          className="hover:opacity-70"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

export function TagList({ tags = [], onRemove, size = 'sm' }) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Tag key={tag} tag={tag} onRemove={onRemove} size={size} />
      ))}
    </div>
  )
}

function TagInput({ value = [], onChange, placeholder = 'Add tag...', suggestions = [] }) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAddTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        handleAddTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-lg bg-white min-h-[42px]">
        {value.map((tag) => (
          <Tag key={tag} tag={tag} onRemove={handleRemoveTag} />
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="flex-1 min-w-[100px] outline-none text-sm"
          placeholder={value.length === 0 ? placeholder : ''}
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white shadow-lg max-h-32 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleAddTag(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Plus className="h-3 w-3 text-gray-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Press Enter to add a tag
      </p>
    </div>
  )
}

export default TagInput
