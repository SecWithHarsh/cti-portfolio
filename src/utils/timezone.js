// Timezone utility functions for consistent IST handling

export const INDIA_TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_LOCALE = 'en-IN';

/**
 * Format date/time consistently in IST
 * @param {Date} date - Date object to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date/time string
 */
export const formatDateIST = (date = new Date(), options = {}) => {
  try {
    const defaultOptions = {
      timeZone: INDIA_TIMEZONE,
      ...options
    };
    return date.toLocaleDateString(DEFAULT_LOCALE, defaultOptions);
  } catch (error) {
    console.warn('Error formatting date in IST:', error);
    return date.toLocaleDateString();
  }
};

/**
 * Format time consistently in IST
 * @param {Date} date - Date object to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatTimeIST = (date = new Date(), options = {}) => {
  try {
    const defaultOptions = {
      timeZone: INDIA_TIMEZONE,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      ...options
    };
    return date.toLocaleTimeString(DEFAULT_LOCALE, defaultOptions);
  } catch (error) {
    console.warn('Error formatting time in IST:', error);
    return date.toLocaleTimeString();
  }
};

/**
 * Format full date-time consistently in IST
 * @param {Date} date - Date object to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date-time string
 */
export const formatDateTimeIST = (date = new Date(), options = {}) => {
  try {
    const defaultOptions = {
      timeZone: INDIA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      ...options
    };
    return date.toLocaleString(DEFAULT_LOCALE, defaultOptions);
  } catch (error) {
    console.warn('Error formatting date-time in IST:', error);
    return date.toLocaleString();
  }
};

/**
 * Get current time in IST
 * @returns {string} Current time in IST format
 */
export const getCurrentTimeIST = () => {
  return formatTimeIST(new Date()) + ' IST';
};

/**
 * Get current date in IST
 * @returns {string} Current date in IST format
 */
export const getCurrentDateIST = () => {
  return formatDateIST(new Date());
};

/**
 * Convert any date to IST display format
 * @param {Date|string} dateInput - Date input to convert
 * @returns {Object} Object with formatted date and time in IST
 */
export const convertToIST = (dateInput) => {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date input');
    }
    
    return {
      date: formatDateIST(date),
      time: formatTimeIST(date),
      dateTime: formatDateTimeIST(date),
      timezone: 'IST'
    };
  } catch (error) {
    console.warn('Error converting to IST:', error);
    const now = new Date();
    return {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      dateTime: now.toLocaleString(),
      timezone: 'Local'
    };
  }
};
