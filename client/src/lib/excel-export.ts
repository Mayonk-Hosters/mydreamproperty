import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Utility function to format date for Excel
const formatDateForExcel = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Export Property Inquiries to Excel
export const exportInquiriesToExcel = (inquiries: any[], properties: any[] = []) => {
  const worksheet = XLSX.utils.json_to_sheet(
    inquiries.map((inquiry, index) => {
      const property = properties.find(p => p.id === inquiry.propertyId);
      return {
        'Sr. No.': index + 1,
        'Name': inquiry.name || 'N/A',
        'Email': inquiry.email || 'N/A',
        'Phone': inquiry.phone || 'Not Provided',
        'Property Title': property?.title || 'Unknown Property',
        'Property Number': property?.propertyNumber || 'N/A',
        'Property Type': property?.propertyType || 'N/A',
        'Property Price': property?.price ? `₹${property.price.toLocaleString('en-IN')}` : 'N/A',
        'Message': inquiry.message || 'No message',
        'Inquiry Date': formatDateForExcel(inquiry.createdAt),
        'Status': 'New Inquiry'
      };
    })
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Property Inquiries');

  // Auto-fit column widths
  const columnWidths = [
    { wch: 8 },   // Sr. No.
    { wch: 20 },  // Name
    { wch: 25 },  // Email
    { wch: 15 },  // Phone
    { wch: 30 },  // Property Title
    { wch: 15 },  // Property Number
    { wch: 15 },  // Property Type
    { wch: 15 },  // Property Price
    { wch: 40 },  // Message
    { wch: 18 },  // Inquiry Date
    { wch: 12 }   // Status
  ];
  worksheet['!cols'] = columnWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = `Property_Inquiries_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(data, fileName);
};

// Export Contact Messages to Excel
export const exportContactMessagesToExcel = (contactMessages: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    contactMessages.map((message, index) => ({
      'Sr. No.': index + 1,
      'Name': message.name || 'N/A',
      'Email': message.email || 'N/A',
      'Phone': message.mobile || message.phone || 'Not Provided',
      'Subject': message.subject || 'General Inquiry',
      'Message': message.message || 'No message',
      'Contact Date': formatDateForExcel(message.createdAt),
      'Status': message.isRead ? 'Read' : 'Unread'
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Messages');

  // Auto-fit column widths
  const columnWidths = [
    { wch: 8 },   // Sr. No.
    { wch: 20 },  // Name
    { wch: 25 },  // Email
    { wch: 15 },  // Phone
    { wch: 25 },  // Subject
    { wch: 40 },  // Message
    { wch: 18 },  // Contact Date
    { wch: 12 }   // Status
  ];
  worksheet['!cols'] = columnWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = `Contact_Messages_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(data, fileName);
};

// Export Home Loan Inquiries to Excel
export const exportHomeLoanInquiriesToExcel = (homeLoanInquiries: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    homeLoanInquiries.map((inquiry, index) => ({
      'Sr. No.': index + 1,
      'Name': inquiry.name || 'N/A',
      'Email': inquiry.email || 'N/A',
      'Phone': inquiry.phone || 'Not Provided',
      'Loan Type': inquiry.loanType || 'N/A',
      'Property Location': inquiry.propertyLocation || 'N/A',
      'Property Value': inquiry.propertyValue ? `₹${parseInt(inquiry.propertyValue).toLocaleString('en-IN')}` : 'N/A',
      'Loan Amount': inquiry.loanAmount ? `₹${parseInt(inquiry.loanAmount).toLocaleString('en-IN')}` : 'N/A',
      'Monthly Income': inquiry.monthlyIncome ? `₹${parseInt(inquiry.monthlyIncome).toLocaleString('en-IN')}` : 'N/A',
      'Employment Type': inquiry.employmentType || 'N/A',
      'Credit Score': inquiry.creditScore || 'N/A',
      'Purpose': inquiry.purpose || 'N/A',
      'Additional Info': inquiry.additionalInfo || 'No additional information',
      'Application Date': formatDateForExcel(inquiry.createdAt),
      'Status': inquiry.isRead ? 'Reviewed' : 'Pending Review'
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Home Loan Inquiries');

  // Auto-fit column widths
  const columnWidths = [
    { wch: 8 },   // Sr. No.
    { wch: 20 },  // Name
    { wch: 25 },  // Email
    { wch: 15 },  // Phone
    { wch: 15 },  // Loan Type
    { wch: 20 },  // Property Location
    { wch: 15 },  // Property Value
    { wch: 15 },  // Loan Amount
    { wch: 15 },  // Monthly Income
    { wch: 15 },  // Employment Type
    { wch: 12 },  // Credit Score
    { wch: 20 },  // Purpose
    { wch: 30 },  // Additional Info
    { wch: 18 },  // Application Date
    { wch: 15 }   // Status
  ];
  worksheet['!cols'] = columnWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = `Home_Loan_Inquiries_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(data, fileName);
};

// Export All Data in Single Excel File with Multiple Sheets
export const exportAllDataToExcel = (
  inquiries: any[],
  contactMessages: any[],
  homeLoanInquiries: any[],
  properties: any[] = []
) => {
  const workbook = XLSX.utils.book_new();

  // Property Inquiries Sheet
  const inquiriesSheet = XLSX.utils.json_to_sheet(
    inquiries.map((inquiry, index) => {
      const property = properties.find(p => p.id === inquiry.propertyId);
      return {
        'Sr. No.': index + 1,
        'Name': inquiry.name || 'N/A',
        'Email': inquiry.email || 'N/A',
        'Phone': inquiry.phone || 'Not Provided',
        'Property Title': property?.title || 'Unknown Property',
        'Property Number': property?.propertyNumber || 'N/A',
        'Message': inquiry.message || 'No message',
        'Inquiry Date': formatDateForExcel(inquiry.createdAt)
      };
    })
  );
  XLSX.utils.book_append_sheet(workbook, inquiriesSheet, 'Property Inquiries');

  // Contact Messages Sheet
  const contactSheet = XLSX.utils.json_to_sheet(
    contactMessages.map((message, index) => ({
      'Sr. No.': index + 1,
      'Name': message.name || 'N/A',
      'Email': message.email || 'N/A',
      'Phone': message.mobile || message.phone || 'Not Provided',
      'Subject': message.subject || 'General Inquiry',
      'Message': message.message || 'No message',
      'Contact Date': formatDateForExcel(message.createdAt),
      'Status': message.isRead ? 'Read' : 'Unread'
    }))
  );
  XLSX.utils.book_append_sheet(workbook, contactSheet, 'Contact Messages');

  // Home Loan Inquiries Sheet
  const homeLoanSheet = XLSX.utils.json_to_sheet(
    homeLoanInquiries.map((inquiry, index) => ({
      'Sr. No.': index + 1,
      'Name': inquiry.name || 'N/A',
      'Email': inquiry.email || 'N/A',
      'Phone': inquiry.phone || 'Not Provided',
      'Loan Type': inquiry.loanType || 'N/A',
      'Property Location': inquiry.propertyLocation || 'N/A',
      'Property Value': inquiry.propertyValue ? `₹${parseInt(inquiry.propertyValue).toLocaleString('en-IN')}` : 'N/A',
      'Loan Amount': inquiry.loanAmount ? `₹${parseInt(inquiry.loanAmount).toLocaleString('en-IN')}` : 'N/A',
      'Monthly Income': inquiry.monthlyIncome ? `₹${parseInt(inquiry.monthlyIncome).toLocaleString('en-IN')}` : 'N/A',
      'Employment Type': inquiry.employmentType || 'N/A',
      'Application Date': formatDateForExcel(inquiry.createdAt),
      'Status': inquiry.isRead ? 'Reviewed' : 'Pending Review'
    }))
  );
  XLSX.utils.book_append_sheet(workbook, homeLoanSheet, 'Home Loan Inquiries');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = `Complete_CRM_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(data, fileName);
};