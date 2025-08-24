import { Task } from "@/types";

/**
 * Formats a date and time into a readable Thai string.
 */
export const formatThaiDateTime = (dateString: string, timeString: string): string => {
  if (!dateString || !timeString) return 'N/A';

  const dateParts = String(dateString).split('-').map(Number);
  const timeParts = String(timeString).split(':').map(Number);

  if (dateParts.length !== 3 || timeParts.length !== 2) {
    return 'Invalid Format';
  }

  const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
  };
  
  const formattedDate = new Intl.DateTimeFormat('th-TH', options).format(date);
  return formattedDate.replace(' ', ', ') + ' น.';
};

/**
 * Creates a detailed status message for a task.
 */
export const getTaskStatusInfo = (task: Task): { text: string; state: string } => {
  if (task.status === 'Completed') {
    return { text: 'งานเสร็จสิ้นแล้ว', state: 'completed' };
  }
  if (!task.startDate || !task.startTime || !task.endDate || !task.endTime) {
    return { text: 'ไม่มีข้อมูลเวลา', state: 'error' };
  }

  // --- Using the more robust manual parsing method ---
  const endDateParts = String(task.endDate).split('-').map(Number);
  const endTimeParts = String(task.endTime).split(':').map(Number);

  if (endDateParts.length !== 3 || endTimeParts.length !== 2) {
    return { text: 'ข้อมูลเวลาไม่ถูกต้อง', state: 'error' };
  }

  const endDateTime = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2], endTimeParts[0], endTimeParts[1]);
  // ---

  if (isNaN(endDateTime.getTime())) {
    return { text: 'ข้อมูลเวลาไม่ถูกต้อง', state: 'error' };
  }
  
  const now = new Date();
  const msToEnd = endDateTime.getTime() - now.getTime();

  const formatDuration = (ms: number, prefix: string): string => {
    const totalSeconds = Math.abs(ms) / 1000;
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

    let parts = [];
    if (days > 0) parts.push(`${days} วัน`);
    if (hours > 0) parts.push(`${hours} ชั่วโมง`);
    if (minutes > 0 && days === 0) parts.push(`${minutes} นาที`);
    
    return `${prefix} ${parts.join(' ')}`;
  };

  if (msToEnd <= 0) {
    return { text: formatDuration(msToEnd, 'เกินกำหนดเวลา'), state: 'overdue' };
  }

  return { text: `เหลือเวลา: ${formatDuration(msToEnd, '')}`, state: 'ongoing' };
};