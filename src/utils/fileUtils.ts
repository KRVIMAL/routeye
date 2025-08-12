// src/utils/fileUtils.ts
export class FileUtils {
  /**
   * Validates file type based on accepted types
   */
  static validateFileType(file: File, acceptedTypes: string[]): boolean {
    return acceptedTypes.some(type => 
      file.name.toLowerCase().endsWith(type.replace('.', ''))
    );
  }

  /**
   * Validates file size in MB
   */
  static validateFileSize(file: File, maxSizeMB: number): boolean {
    const fileSizeMB = file.size / (1024 * 1024);
    return fileSizeMB <= maxSizeMB;
  }

  /**
   * Formats file size to human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Reads CSV file and returns parsed data
   */
  static async parseCSVFile(file: File): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV file must contain at least a header row and one data row');
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj: Record<string, any> = {};
            
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            
            return obj;
          });
          
          resolve(data);
        } catch (error) {
          reject(new Error(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Validates CSV headers against required columns
   */
  static validateCSVHeaders(
    headers: string[], 
    requiredColumns: string[], 
    optionalColumns: string[] = []
  ): { valid: boolean; missing: string[]; extra: string[] } {
    const headerSet = new Set(headers.map(h => h.toLowerCase()));
    const requiredSet = new Set(requiredColumns.map(c => c.toLowerCase()));
    const allAllowed = new Set([...requiredColumns, ...optionalColumns].map(c => c.toLowerCase()));
    
    const missing = requiredColumns.filter(col => !headerSet.has(col.toLowerCase()));
    const extra = headers.filter(header => !allAllowed.has(header.toLowerCase()));
    
    return {
      valid: missing.length === 0,
      missing,
      extra
    };
  }

  /**
   * Creates a downloadable template CSV file
   */
  static downloadTemplate(
    filename: string,
    requiredColumns: string[],
    optionalColumns: string[] = [],
    sampleData: Record<string, any>[] = []
  ): void {
    const allColumns = [...requiredColumns, ...optionalColumns];
    const csvContent = [
      // Header row
      allColumns.join(','),
      // Sample data rows
      ...sampleData.map(row => 
        allColumns.map(col => row[col] || '').join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.click();
    
    window.URL.revokeObjectURL(url);
  }
}