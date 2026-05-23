export const buildWhatsAppUrl = (phoneNumber, message) => {
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const buildOfficeWhatsAppUrl = (officeNumber, workerName, workerNo) => {
  const message = `مرحباً، أنا مهتم بالعاملة ${workerName} رقم ${workerNo}.\nأرجو التواصل معي.\n(عن طريق: عادل — مكتب 31)`;
  return buildWhatsAppUrl(officeNumber, message);
};
