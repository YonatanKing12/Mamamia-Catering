import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-white">
      <AccessibilityToolbar />
      <main className="p-8">
        <h1 className="text-4xl font-bold text-center text-dark-brown">מאמאמיה - קייטרינג ביתי כשר</h1>
        <p className="text-center mt-4 text-xl">האתר בטעינה...</p>
      </main>
    </div>
  );
}