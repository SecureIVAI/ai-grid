import { replaceOklchStyles, restoreOriginalStyles } from './colorConverter';

export const downloadPDFReport = async (elementId = 'results-container') => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
  
      // 1. Replace OKLCH colors before capture
      const originalStyles = replaceOklchStyles();
      await new Promise((resolve) => setTimeout(resolve, 50));
  
      const reportElement = document.getElementById(elementId);
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        ignoreElements: (el) => el.tagName === 'SCRIPT',
      });
  
      // 2. Restore original styles
      restoreOriginalStyles(originalStyles);
  
      // PDF with margins configuration
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Margin settings (in mm)
      const margin = {
        top: 10,
        right: 5,
        bottom: 20,
        left: 5
      };
  
      // Calculate available width/height after margins
      const contentWidth = pageWidth - margin.left - margin.right;
      const contentHeight = pageHeight - margin.top - margin.bottom;
  
      // Calculate image dimensions to fit within margins
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      // Add content with margins
      pdf.addImage(
        canvas.toDataURL('image/png'), 
        'PNG',
        margin.left,
        margin.top,
        imgWidth,
        imgHeight
      );
  
      // Add footer with copyright
      const footerText =  `Product by Secure IVAI • IT Services and IT Consulting • © ${new Date().getFullYear()}`
      pdf.setFontSize(10);
      pdf.text(
        footerText,
        margin.left,
        pageHeight - margin.bottom + 10,
        { align: 'left' }
      );
  
      pdf.save(`survey-results-${new Date().toISOString().slice(0, 10)}.pdf`);
  
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again or contact support.');
    }
  };