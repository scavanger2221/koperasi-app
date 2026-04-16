import { useState } from 'react'

export function useFormValidation() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validate = (errors: Record<string, string>) => {
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return false
    }
    setFieldErrors({})
    return true
  }

  const clearErrors = () => setFieldErrors({})

  return { fieldErrors, validate, clearErrors }
}
