/**
 * @file helpers.js
 * @summary Helper functions for data manipulation.
 * @description This file contains helper functions for data manipulation, including formatting dates.
 * @owner Sergi Rovira Morral <sroviramorral@gmail.com>
 * @license MIT
 * @see LICENSE.txt
 * @since 2024
 */

const todayDate = new Date();
let tomorrowDate = new Date();
tomorrowDate.setDate(todayDate.getDate() + 1);

// Check if the device is a mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Formats a date to a string with dd/mm/YYYY format
 * @param {*} date 
 * @returns 
 */
const formatDate = (date) => {
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: isMobileDevice() ? undefined : 'numeric'
    };
    return new Date(date).toLocaleDateString(undefined, options);
}

/**
* Returns the due date string for the task
* @returns {string} - the due date string ('Today', 'Tomorrow', or formatted date)
*/
const getDueDateString = (due_date) => {
    if (isMobileDevice) return formatDate(due_date.toDate());

    let dateString = '';
    const dueDate = due_date.toDate();
    if (dueDate.toDateString() === todayDate.toDateString()) {
        dateString = 'Today';
    } else if (dueDate.toDateString() === tomorrowDate.toDateString()) {
        dateString = 'Tomorrow';
    } else {
        dateString = formatDate(dueDate);
    }
    

    return dateString;
}

/**
 * Get the date set to 0 time in order to compare dates
 * @param {Date} - the date to be formatted
 * @returns {Date} - the date with a 0-set time
 */
const getZeroTimeDate = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

/**
* Calculates the brightness of a color in RGB format
* @param {string} color - the color in RGB format (e.g. #RRGGBB)
* @returns {number} the brightness value of the color (from 0 to 255)
*/
const calculateBrightness = (color) => {
    // Remove the '#' character from the color string
    color = color.slice(1);

    // Convert the color to RGB values
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Calculate the brightness value using the formula: (R * 299 + G * 587 + B * 114) / 1000
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness;
};


export { formatDate, todayDate, tomorrowDate, calculateBrightness, getDueDateString, getZeroTimeDate };