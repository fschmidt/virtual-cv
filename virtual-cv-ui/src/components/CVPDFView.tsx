import { memo } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import CVDocument from './CVDocument';
import type { CVData, CV_SECTIONS } from '../types';
import type { ContentMap } from '../services';
import './CVPDFView.css';

interface CVPDFViewProps {
  cvData: CVData;
  contentMap: ContentMap;
  sections: typeof CV_SECTIONS;
}

function CVPDFView({ cvData, contentMap, sections }: CVPDFViewProps) {
  return (
    <div className="pdf-viewer-container">
      <PDFViewer width="100%" height="100%" showToolbar={true}>
        <CVDocument cvData={cvData} contentMap={contentMap} sections={sections} />
      </PDFViewer>
    </div>
  );
}

export default memo(CVPDFView);
