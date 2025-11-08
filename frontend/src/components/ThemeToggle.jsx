import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute top-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: isDark ? '#3b82f6' : '#fbbf24',
          left: isDark ? '30px' : '4px',
        }}
        layout
        transition={{
          type: 'spring',
          stiffness: 700,
          damping: 30,
        }}
      >
        {isDark ? (
          <FaMoon className="text-white text-xs" />
        ) : (
          <FaSun className="text-white text-xs" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
