import { FaBed, FaCheckCircle, FaTimesCircle, FaTools } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BedGrid = ({ beds, onBedClick }) => {
  const getBedStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300';
      case 'occupied':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300';
      case 'maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300';
      case 'reserved':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-300';
    }
  };

  const getBedGlow = (status) => {
    switch (status) {
      case 'available':
        return 'hover-glow-success';
      case 'occupied':
        return 'hover-glow-danger';
      case 'maintenance':
        return 'hover-glow-warning';
      case 'reserved':
        return 'hover-glow-primary';
      default:
        return '';
    }
  };

  const getBedIcon = (status) => {
    switch (status) {
      case 'available':
        return <FaCheckCircle className="text-green-600 dark:text-green-400" />;
      case 'occupied':
        return <FaTimesCircle className="text-red-600 dark:text-red-400" />;
      case 'maintenance':
        return <FaTools className="text-yellow-600 dark:text-yellow-400" />;
      default:
        return <FaBed className="dark:text-slate-400" />;
    }
  };

  // Group beds by floor and room
  const groupedBeds = beds.reduce((acc, bed) => {
    if (!acc[bed.floor]) {
      acc[bed.floor] = {};
    }
    if (!acc[bed.floor][bed.room_number]) {
      acc[bed.floor][bed.room_number] = [];
    }
    acc[bed.floor][bed.room_number].push(bed);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedBeds).sort(([a], [b]) => a - b).map(([floor, rooms], floorIndex) => (
        <motion.div
          key={floor}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: floorIndex * 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Floor {floor}</h3>
          <div className="space-y-4">
            {Object.entries(rooms).sort(([a], [b]) => a.localeCompare(b)).map(([roomNumber, roomBeds], roomIndex) => (
              <motion.div
                key={roomNumber}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (floorIndex * 0.1) + (roomIndex * 0.05) }}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-800/50"
              >
                <h4 className="font-medium text-gray-700 dark:text-slate-300 mb-3">
                  Room {roomNumber} ({roomBeds[0].room_type})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {roomBeds.map((bed, bedIndex) => (
                    <motion.div
                      key={bed.bed_id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (floorIndex * 0.1) + (roomIndex * 0.05) + (bedIndex * 0.02) }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onBedClick && onBedClick(bed)}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${getBedStatusColor(bed.status)} ${getBedGlow(bed.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{bed.bed_number}</span>
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {getBedIcon(bed.status)}
                        </motion.div>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="capitalize">{bed.bed_type}</p>
                        <p className="capitalize font-medium">{bed.status}</p>
                        {bed.patient_name && (
                          <p className="text-xs mt-1 truncate" title={bed.patient_name}>
                            {bed.patient_name}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BedGrid;
