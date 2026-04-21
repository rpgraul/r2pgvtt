export function createUIState() {
  let isSidebarOpen = $state(false);
  let activeTab = $state('chat');
  let isHelpOpen = $state(false);

  return {
    get isSidebarOpen() {
      return isSidebarOpen;
    },
    get activeTab() {
      return activeTab;
    },
    get isHelpOpen() {
      return isHelpOpen;
    },
    set isHelpOpen(v) {
      isHelpOpen = v;
    },
    toggleSidebar: () => (isSidebarOpen = !isSidebarOpen),
    setTab: (tab) => (activeTab = tab),
    toggleHelp: () => (isHelpOpen = !isHelpOpen),
  };
}

export const uiState = createUIState();
