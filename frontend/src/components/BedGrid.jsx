import { FaBed, FaCheckCircle, FaTimesCircle, FaTools } from 'react-icons/fa';

const BedGrid = ({ beds, onBedClick }) => {
  const getBedStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'reserved':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getBedIcon = (status) => {
    switch (status) {
      case 'available':
        return <FaCheckCircle className="text-green-600" />;
      case 'occupied':
        return <FaTimesCircle className="text-red-600" />;
      case 'maintenance':
        return <FaTools className="text-yellow-600" />;
      default:
        return <FaBed />;
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
      {Object.entries(groupedBeds).sort(([a], [b]) => a - b).map(([floor, rooms]) => (
        <div key={floor} className="card">
          <h3 className="text-lg font-semibold mb-4">Floor {floor}</h3>
          <div className="space-y-4">
            {Object.entries(rooms).sort(([a], [b]) => a.localeCompare(b)).map(([roomNumber, roomBeds]) => (
              <div key={roomNumber} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">
                  Room {roomNumber} ({roomBeds[0].room_type})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {roomBeds.map((bed) => (
                    <div
                      key={bed.bed_id}
                      onClick={() => onBedClick && onBedClick(bed)}
                      className={`border-2 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${getBedStatusColor(bed.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{bed.bed_number}</span>
                        {getBedIcon(bed.status)}
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
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BedGrid;
