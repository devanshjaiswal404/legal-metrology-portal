import React from 'react';
import HistoryRepository from '../HistoryRepository';

export default function InspectionRepositoryTab({ onViewAudit }) {
  return <HistoryRepository onViewAudit={onViewAudit} />;
}
