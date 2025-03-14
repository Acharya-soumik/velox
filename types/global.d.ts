// Add TypeScript interface for window object to fix the currentEditorCode property error
interface Window {
  currentEditorCode?: string;
}
