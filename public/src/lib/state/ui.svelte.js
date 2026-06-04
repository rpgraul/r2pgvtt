export function createUIState() {
  let isSidebarOpen = $state(false);
  let activeTab = $state('chat');
  let isHelpOpen = $state(false);
  let activeView = $state('grid');

  return {
    get isSidebarOpen() {
      return isSidebarOpen;
    },
    set isSidebarOpen(v) {
      isSidebarOpen = v;
    },
    get activeTab() {
      return activeTab;
    },
    set activeTab(v) {
      activeTab = v;
    },
    get isHelpOpen() {
      return isHelpOpen;
    },
    set isHelpOpen(v) {
      isHelpOpen = v;
    },
    get activeView() {
      return activeView;
    },
    set activeView(v) {
      activeView = v;
    },
    toggleSidebar: () => (isSidebarOpen = !isSidebarOpen),
    toggleHelp: () => (isHelpOpen = !isHelpOpen),
  };
}

export const uiState = createUIState();
