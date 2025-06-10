import { AdminLayout } from "@/components/admin/admin-layout";

function MessagesTestPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Unified Messages Test</h1>
        <p>This is a test page to verify routing works.</p>
      </div>
    </AdminLayout>
  );
}

export default MessagesTestPage;