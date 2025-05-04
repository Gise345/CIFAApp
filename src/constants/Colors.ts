// Define your color palette
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

// Export a default Colors object
const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#4CD964',
    warning: '#FFCC00',
    error: '#FF3B30',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#32D74B',
    warning: '#FFD60A',
    error: '#FF453A',
  },
};

// Export the Colors object as default
export default Colors;
