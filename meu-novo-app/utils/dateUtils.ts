export const formatDate = (date: string): string => {
  // Remove caracteres não numéricos
  const cleaned = date.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  if (cleaned.length !== 8) return date;
  
  // Formata para dd/mm/yyyy
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

export const isValidDate = (date: string): boolean => {
  // Remove caracteres não numéricos
  const cleaned = date.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  if (cleaned.length !== 8) return false;
  
  const day = parseInt(cleaned.slice(0, 2));
  const month = parseInt(cleaned.slice(2, 4));
  const year = parseInt(cleaned.slice(4, 8));
  
  // Verifica se os valores são válidos
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  // Verifica meses com 30 dias
  if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) return false;
  
  // Verifica fevereiro
  if (month === 2) {
    // Verifica ano bissexto
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (isLeapYear && day > 29) return false;
    if (!isLeapYear && day > 28) return false;
  }
  
  return true;
}; 