"use client";

import { useState } from "react";
import { format, addDays, subDays, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileUpload } from "@/components/ui/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DFSBattersView } from "@/components/dfs/DFSBattersView";
import { DFSPitchersView } from "@/components/dfs/DFSPitchersView";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

export default function DFSPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Format the selected date for display and API requests
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const displayDate = format(selectedDate, "MMMM d, yyyy");

  // Get today's date for comparison
  const today = new Date();
  const isToday =
    format(selectedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  const isTomorrow =
    format(selectedDate, "yyyy-MM-dd") ===
    format(addDays(today, 1), "yyyy-MM-dd");

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/dfs/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const result = await response.json();
    return result;
  };

  const handleUploadError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Upload Failed",
      description: error,
    });
  };

  const handleUploadSuccess = (result: {
    message: string;
    targetDate: string;
  }) => {
    // Update the selected date to match the CSV's date
    const csvDate = parse(result.targetDate, "yyyy-MM-dd", new Date());
    setSelectedDate(csvDate);

    toast({
      title: "Success",
      description: result.message,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Date Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date for Projections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {isToday
                  ? "Today's Games"
                  : isTomorrow
                  ? "Tomorrow's Games"
                  : "Games for"}
                :
              </p>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {displayDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  >
                    →
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Upload DraftKings CSV
              </p>
              <FileUpload
                onUpload={handleFileUpload}
                onError={handleUploadError}
                onSuccess={handleUploadSuccess}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="batters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batters">Batters</TabsTrigger>
          <TabsTrigger value="pitchers">Pitchers</TabsTrigger>
        </TabsList>
        <TabsContent value="batters">
          <DFSBattersView date={formattedDate} />
        </TabsContent>
        <TabsContent value="pitchers">
          <DFSPitchersView date={formattedDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
