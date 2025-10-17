/**
 * Time formatting utilities for consistent 12-hour time display
 */

export class TimeFormat {
  /**
   * Format a Date object or date string to 12-hour time string
   * @param date - Date object or date string to format
   * @param options - Intl.DateTimeFormatOptions for customization
   * @returns Formatted time string (e.g., "2:30 PM")
   */
  static formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validate that we have a valid date
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatTime:', date);
      return 'Invalid Date';
    }

    return dateObj.toLocaleTimeString('en-US', { ...defaultOptions, ...options });
  }

  /**
   * Format a Date object or date string to 12-hour time with seconds
   * @param date - Date object or date string to format
   * @returns Formatted time string (e.g., "2:30:45 PM")
   */
  static formatTimeWithSeconds(date: Date | string): string {
    return this.formatTime(date, { second: '2-digit' });
  }

  /**
   * Format a Date object or date string to 12-hour time for display in UI
   * @param date - Date object or date string to format
   * @returns Formatted time string (e.g., "2:30 PM")
   */
  static formatDisplayTime(date: Date | string): string {
    return this.formatTime(date);
  }

  /**
   * Format a Date object or date string to 12-hour time for CSV export
   * @param date - Date object or date string to format
   * @returns Formatted time string (e.g., "2:30 PM")
   */
  static formatCSVTime(date: Date | string): string {
    return this.formatTime(date);
  }

  /**
   * Format duration in minutes to hours and minutes
   * @param minutes - Duration in minutes
   * @returns Formatted duration string (e.g., "2h 30m")
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  /**
   * Format duration in minutes to HH:MM format
   * @param minutes - Duration in minutes
   * @returns Formatted duration string (e.g., "02:30")
   */
  static formatDurationHHMM(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Format a Date object or date string to date string
   * @param date - Date object or date string to format
   * @returns Formatted date string (e.g., "12/25/2023")
   */
  static formatDate(date: Date | string): string {
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validate that we have a valid date
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDate:', date);
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString('en-US');
  }

  /**
   * Format a Date object or date string to date and time string
   * @param date - Date object or date string to format
   * @returns Formatted date and time string (e.g., "12/25/2023, 2:30 PM")
   */
  static formatDateTime(date: Date | string): string {
    return `${this.formatDate(date)}, ${this.formatTime(date)}`;
  }

  /**
   * Calculate and format duration between two dates
   * @param startTime - Start date or date string
   * @param endTime - End date or date string (defaults to now)
   * @returns Formatted duration string (e.g., "2h 30m")
   */
  static formatDurationBetween(startTime: Date | string, endTime: Date | string = new Date()): string {
    // Convert strings to Date objects if needed
    const startDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime;
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid dates provided to formatDurationBetween:', { startTime, endTime });
      return 'Invalid Duration';
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return this.formatDuration(diffMinutes);
  }

  /**
   * Calculate and format duration between two dates in HH:MM format
   * @param startTime - Start date or date string
   * @param endTime - End date or date string (defaults to now)
   * @returns Formatted duration string (e.g., "02:30")
   */
  static formatDurationBetweenHHMM(startTime: Date | string, endTime: Date | string = new Date()): string {
    // Convert strings to Date objects if needed
    const startDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime;
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid dates provided to formatDurationBetweenHHMM:', { startTime, endTime });
      return 'Invalid Duration';
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return this.formatDurationHHMM(diffMinutes);
  }
}
