import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminHeader } from "@/components/admin/admin-header";
import ContactInfoForm from "@/components/admin/contact-info-form";

export default function AdminContactPage() {
  return (
    <AdminLayout>
      <Helmet>
        <title>Contact Information | Admin | My Dream Property</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <AdminHeader
          title="Contact Information"
          description="Update your company's contact information, business hours and map location"
        />
        
        <div className="mt-8">
          <ContactInfoForm />
        </div>
      </div>
    </AdminLayout>
  );
}