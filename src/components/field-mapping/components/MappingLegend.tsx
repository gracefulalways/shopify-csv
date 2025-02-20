
import { InfoIcon, StarIcon, CircleDotIcon } from "lucide-react";

export const MappingLegend = () => {
  return (
    <div className="flex gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mr-4">
        <StarIcon className="h-4 w-4 text-red-500" />
        <span className="text-sm">Required</span>
      </div>
      <div className="flex items-center gap-2 mr-4">
        <CircleDotIcon className="h-4 w-4 text-orange-500" />
        <span className="text-sm">Conditional</span>
      </div>
      <div className="flex items-center gap-2">
        <InfoIcon className="h-4 w-4 text-blue-500" />
        <span className="text-sm">Recommended</span>
      </div>
    </div>
  );
};
