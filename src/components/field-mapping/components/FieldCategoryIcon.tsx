
import { InfoIcon, StarIcon, CircleDotIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getFieldCategory } from "@/utils/fieldMappingUtils";
import { FieldCategoryIconProps } from "../types";

export const FieldCategoryIcon = ({ field }: FieldCategoryIconProps) => {
  const category = getFieldCategory(field);
  
  if (category === "mandatory") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <StarIcon className="h-4 w-4 text-red-500 inline mr-2" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Required for successful import</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (category === "conditional") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <CircleDotIcon className="h-4 w-4 text-orange-500 inline mr-2" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Required if using variants or specific features</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (category === "important") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="h-4 w-4 text-blue-500 inline mr-2" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Recommended for better product listings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return null;
};
