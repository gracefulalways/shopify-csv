
import { QuestionMarkCircle } from "lucide-react";
import { Separator } from "./ui/separator";

export const Footer = () => {
  return (
    <div className="mt-12">
      <Separator className="mb-6" />
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Copyright 2025. All Rights Reserved. Graceful Media, LLC
        </div>
        <a 
          href="https://www.graceful.agency/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-gray-900 transition-colors"
        >
          <QuestionMarkCircle size={20} />
          Need Help?
        </a>
      </div>
    </div>
  );
};
