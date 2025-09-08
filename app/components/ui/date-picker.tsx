'use client'

import { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import { Calendar } from 'lucide-react'
import "react-datepicker/dist/react-datepicker.css"

interface CustomDatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholderText?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

const CustomDatePicker = forwardRef<HTMLInputElement, CustomDatePickerProps>(
  ({ selected, onChange, placeholderText, minDate, maxDate, className }, ref) => {
    return (
      <div className="relative">
        <DatePicker
          ref={ref}
          selected={selected}
          onChange={onChange}
          placeholderText={placeholderText}
          minDate={minDate}
          maxDate={maxDate}
          className={`w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`}
          dateFormat="MMMM d, yyyy"
          showPopperArrow={false}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
    )
  }
)

CustomDatePicker.displayName = 'CustomDatePicker'

export default CustomDatePicker