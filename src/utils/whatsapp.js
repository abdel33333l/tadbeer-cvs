export const buildWhatsAppUrl = (phoneNumber, message) => {
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const buildOfficeWhatsAppUrl = (officeNumber, workerName, workerNo) => {
  const manager = import.meta.env.VITE_OFFICE_MANAGER || 'عادل';
  const location = import.meta.env.VITE_OFFICE_LOCATION || 'مكتب 31';
  const message = `مرحباً، أنا مهتم بهذه العاملة (${workerName} - ${workerNo}). الرجاء التواصل مع ${manager} - ${location}.`;
  return buildWhatsAppUrl(officeNumber, message);
};
