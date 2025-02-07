
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Trash2Icon } from "lucide-react";

interface Mapping {
  id: string;
  original_filename: string;
  mapping_config: Record<string, string>;
  created_at: string;
}

interface MappingListProps {
  onSelect: (mapping: Mapping) => void;
}

export const MappingList = ({ onSelect }: MappingListProps) => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('mapping_history')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        id: item.id,
        original_filename: item.original_filename,
        mapping_config: item.mapping_config as Record<string, string>,
        created_at: item.created_at || ''
      }));

      setMappings(transformedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMapping = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mapping_history')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) throw error;
      
      setMappings(mappings.filter(m => m.id !== id));
      toast({
        title: "Success",
        description: "Mapping deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMappingSelect = async (mapping: Mapping) => {
    try {
      // Create a new File object from the stored CSV
      const response = await fetch(mapping.csv_url);
      const blob = await response.blob();
      const file = new File([blob], mapping.original_filename, { type: 'text/csv' });
      
      onSelect({ ...mapping, file });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load the saved CSV file",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading saved mappings...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Saved Files</h2>
      {mappings.length === 0 ? (
        <p className="text-gray-500">No saved files found.</p>
      ) : (
        <div className="grid gap-4">
          {mappings.map((mapping) => (
            <Card key={mapping.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{mapping.original_filename}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(mapping.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleMappingSelect(mapping)}
                  >
                    Use This Mapping
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMapping(mapping.id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
