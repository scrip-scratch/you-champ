import { useSearchParams } from "react-router-dom";

/**
 * Hook for managing tab state via URL query parameters
 * This allows tabs to be preserved in browser history and bookmarkable
 * 
 * @param defaultTab - The default tab to use when no tab is specified in URL
 * @returns [activeTab, setActiveTab] - Current tab value and setter function
 * 
 * @example
 * const [activeTab, setActiveTab] = useTabState("info");
 * 
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <TabsList>
 *     <TabsTrigger value="info">Info</TabsTrigger>
 *     <TabsTrigger value="students">Students</TabsTrigger>
 *   </TabsList>
 * </Tabs>
 */
export function useTabState(defaultTab: string = "info") {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get("tab") || defaultTab;
  
  const setActiveTab = (tab: string) => {
    // Use replace: true to avoid creating a new history entry for each tab change
    // This way, browser back button goes to the previous page, not previous tab
    setSearchParams({ tab }, { replace: true });
  };
  
  return [activeTab, setActiveTab] as const;
}

