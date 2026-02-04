import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
// import BlindedResumeTemplate from '../components/blinded_resume_pdf_template';
import BlindedResumeTemplateCOS from '../components/blinded_resumes/blinded_resume_pdf_template_cos';
import BlindedResumeTemplateEngineering from '../components/blinded_resumes/blinded_resume_pdf_template_engineering';
import BlindedResumeTemplateProduct from '../components/blinded_resumes/blinded_resume_pdf_template_product';
import BlindedResumeTemplateMarketing from '../components/blinded_resumes/blinded_resume_pdf_template_marketing';
import BlindedResumeTemplateRevenue from '../components/blinded_resumes/blinded_resume_pdf_template_revenue';
import BlindedResumeTemplateOperations from '../components/blinded_resumes/blinded_resume_pdf_template_operations';
import type { CandidateExtractedData } from '@/types/api';

interface DownloadPdfOptions {
  data: CandidateExtractedData;
  role: string;
  name: string;
}

export const downloadBlindedResume = async ({ data, role, name }: DownloadPdfOptions): Promise<void> => {
  try {
    const blob = await pdf(
      role === "COS" ? <BlindedResumeTemplateCOS data={data} /> : role === "ENGINEERING" ? <BlindedResumeTemplateEngineering data={data} /> : role === "PRODUCT" ? <BlindedResumeTemplateProduct data={data} /> : role === "MARKETING" ? <BlindedResumeTemplateMarketing data={data} /> : role === "REVENUE" ? <BlindedResumeTemplateRevenue data={data} /> : role === "OPERATIONS" ? <BlindedResumeTemplateOperations data={data} /> : <></>
    )?.toBlob();
    
    const fileName = `${name}_blinded_resume.pdf`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}; 