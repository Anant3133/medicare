import { motion } from 'framer-motion';

const LoadingSkeleton = ({ type = "list", count = 3 }) => {
  if (type === "card") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card"
      >
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4 animate-shimmer"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full animate-shimmer"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6 animate-shimmer"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/6 animate-shimmer"></div>
        </div>
      </motion.div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full animate-shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/4 animate-shimmer"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 animate-shimmer"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card"
      >
        <div className="space-y-3">
          {[...Array(count)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4"
            >
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 animate-shimmer"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 animate-shimmer"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 animate-shimmer"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 animate-shimmer"></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return null;
};

export default LoadingSkeleton;
