/**
 * Input Validation and Sanitization Utilities
 *
 * Provides functions for validating and sanitizing user input
 * to prevent XSS attacks and ensure data integrity.
 */

// IPv4 regex pattern
const IPV4_PATTERN = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

// IPv6 regex pattern (simplified - validates structure)
const IPV6_PATTERN = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){2}:(?:[0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){3}:(?:[0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){4}:(?:[0-9a-fA-F]{1,4}:)?[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){5}:[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){6}:$/

/**
 * Validate an IP address (IPv4 or IPv6)
 * @param {string} ip - The IP address to validate
 * @returns {boolean} - True if valid IP address
 */
export function validateIPAddress(ip) {
  if (!ip || typeof ip !== 'string') {
    return false
  }
  const trimmed = ip.trim()
  return IPV4_PATTERN.test(trimmed) || IPV6_PATTERN.test(trimmed)
}

/**
 * Validate IPv4 address only
 * @param {string} ip - The IP address to validate
 * @returns {boolean} - True if valid IPv4 address
 */
export function validateIPv4(ip) {
  if (!ip || typeof ip !== 'string') {
    return false
  }
  return IPV4_PATTERN.test(ip.trim())
}

/**
 * Sanitize text input to prevent XSS
 * Removes HTML tags and dangerous characters
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Sanitize and validate a name field
 * @param {string} name - The name to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {{ valid: boolean, value: string, error?: string }}
 */
export function validateName(name, maxLength = 100) {
  if (!name || typeof name !== 'string') {
    return { valid: true, value: '' } // Name is optional
  }

  const sanitized = sanitizeInput(name)

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      value: sanitized,
      error: `Name must be ${maxLength} characters or less`
    }
  }

  return { valid: true, value: sanitized }
}

/**
 * Sanitize and validate a description field
 * @param {string} description - The description to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {{ valid: boolean, value: string, error?: string }}
 */
export function validateDescription(description, maxLength = 255) {
  if (!description || typeof description !== 'string') {
    return { valid: true, value: '' } // Description is optional
  }

  const sanitized = sanitizeInput(description)

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      value: sanitized,
      error: `Description must be ${maxLength} characters or less`
    }
  }

  return { valid: true, value: sanitized }
}

/**
 * Validate and sanitize tags
 * @param {string[]} tags - Array of tags
 * @param {number} maxTags - Maximum number of tags
 * @param {number} maxTagLength - Maximum length per tag
 * @returns {{ valid: boolean, value: string[], error?: string }}
 */
export function validateTags(tags, maxTags = 20, maxTagLength = 50) {
  if (!tags || !Array.isArray(tags)) {
    return { valid: true, value: [] }
  }

  if (tags.length > maxTags) {
    return {
      valid: false,
      value: tags,
      error: `Maximum ${maxTags} tags allowed`
    }
  }

  const sanitized = tags
    .map(tag => sanitizeInput(String(tag)).toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= maxTagLength)

  return { valid: true, value: [...new Set(sanitized)] } // Remove duplicates
}

/**
 * Validate IP form data before submission
 * @param {object} formData - The form data object
 * @returns {{ valid: boolean, data: object, errors: object }}
 */
export function validateIPFormData(formData) {
  const errors = {}
  const data = {}

  // Validate IP address (required)
  if (!formData.ip_address || !validateIPAddress(formData.ip_address)) {
    errors.ip_address = 'Please enter a valid IP address'
  } else {
    data.ip_address = formData.ip_address.trim()
  }

  // Validate name (optional)
  const nameResult = validateName(formData.name)
  if (!nameResult.valid) {
    errors.name = nameResult.error
  } else {
    data.name = nameResult.value || null
  }

  // Validate description (optional)
  const descResult = validateDescription(formData.description)
  if (!descResult.valid) {
    errors.description = descResult.error
  } else {
    data.description = descResult.value || null
  }

  // Validate tags (optional)
  const tagsResult = validateTags(formData.tags)
  if (!tagsResult.valid) {
    errors.tags = tagsResult.error
  } else {
    data.tags = tagsResult.value
  }

  return {
    valid: Object.keys(errors).length === 0,
    data,
    errors
  }
}

export default {
  validateIPAddress,
  validateIPv4,
  sanitizeInput,
  validateName,
  validateDescription,
  validateTags,
  validateIPFormData
}
