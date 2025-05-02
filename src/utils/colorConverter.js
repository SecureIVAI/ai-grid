import { parse, formatRgb } from 'culori';

/**
 * Replaces all OKLCH styles in the DOM with RGB equivalents.
 * @returns {Array} - An array of original styles to restore later.
 */
export const replaceOklchStyles = () => {
  const originalStyles = [];
  const elements = document.querySelectorAll('*');

  elements.forEach((el) => {
    const computedStyle = getComputedStyle(el);

    // Iterate over all CSS properties
    for (const property of computedStyle) {
      const value = computedStyle.getPropertyValue(property);

      if (value.includes('oklch')) {
        // Save the original style
        originalStyles.push({ el, property, value });

        // Convert OKLCH to RGB
        const rgbValue = convertOklchToRgb(value);

        // Apply the converted value
        el.style.setProperty(property, rgbValue);
      }
    }
  });

  return originalStyles;
};

/**
 * Restores the original OKLCH styles in the DOM.
 * @param {Array} originalStyles - The array of original styles to restore.
 */
export const restoreOriginalStyles = (originalStyles) => {
  originalStyles.forEach(({ el, property, value }) => {
    el.style.setProperty(property, value);
  });
};

/**
 * Converts an OKLCH color string to an RGB color string.
 * @param {string} oklchString - The OKLCH color string (e.g., "oklch(75% 0.2 200deg)").
 * @returns {string} - The RGB color string (e.g., "rgb(66, 133, 244)") or a fallback color.
 */
const convertOklchToRgb = (oklchString) => {
  try {
    const color = parse(oklchString); // Parse the OKLCH string
    if (!color) throw new Error('Invalid OKLCH color');
    return formatRgb(color); // Convert to RGB
  } catch (error) {
    console.error(`Failed to convert OKLCH to RGB: ${oklchString}`, error);
    return 'rgb(0, 0, 0)'; // Fallback to black
  }
};