import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DFSBattersView } from "@/components/dfs/DFSBattersView";
import { DFSPitchersView } from "@/components/dfs/DFSPitchersView";

export default function DFSAnalysisPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">MLB DFS Analysis</h1>

      <Tabs defaultValue="batters" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="batters">Batters</TabsTrigger>
          <TabsTrigger value="pitchers">Pitchers</TabsTrigger>
        </TabsList>

        <TabsContent value="batters">
          <DFSBattersView />
        </TabsContent>

        <TabsContent value="pitchers">
          <DFSPitchersView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
