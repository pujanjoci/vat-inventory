export function exportToCSV(data: any[], filename: string, metadata?: {
  username?: string;
  companyName?: string;
  contact?: string;
  date?: string;
}) {
  if (!data || !data.length) return;
  const csvRows = [];

  if (metadata) {
    if (metadata.username) csvRows.push(`"Exported By","${metadata.username.replace(/"/g, '""')}"`);
    if (metadata.companyName) csvRows.push(`"Company Name","${metadata.companyName.replace(/"/g, '""')}"`);
    if (metadata.contact) csvRows.push(`"Contact","${metadata.contact.replace(/"/g, '""')}"`);
    if (metadata.date) csvRows.push(`"Date","${metadata.date.replace(/"/g, '""')}"`);
    if (Object.keys(metadata).length > 0) csvRows.push("");
  }

  const headers = Object.keys(data[0]);
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] || '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename + '.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
