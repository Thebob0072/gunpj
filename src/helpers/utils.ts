import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Task } from "@/types";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Formats a date and time into a readable Thai string.
 */
export const formatThaiDateTime = (dateString: string, timeString: string): string => {
  if (!dateString || !timeString) return 'N/A';

  try {
    const dateTime = dayjs(`${dateString} ${timeString}`, 'YYYY-MM-DD HH:mm').tz('Asia/Bangkok');
    if (!dateTime.isValid()) return 'Invalid Date';

    return dateTime.format('DD MMMM YYYY HH:mm [น.]');
  } catch {
    return 'Invalid Format';
  }
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

  try {
    const endDateTime = dayjs(`${task.endDate} ${task.endTime}`, 'YYYY-MM-DD HH:mm').tz('Asia/Bangkok');

    if (!endDateTime.isValid()) {
      return { text: 'ข้อมูลเวลาไม่ถูกต้อง', state: 'error' };
    }

    const now = dayjs().tz('Asia/Bangkok');
    const msToEnd = endDateTime.diff(now, 'millisecond');

    const formatDuration = (ms: number, prefix: string): string => {
      const totalSeconds = Math.abs(ms) / 1000;
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

      const parts = [];
      if (days > 0) parts.push(`${days} วัน`);
      if (hours > 0) parts.push(`${hours} ชั่วโมง`);
      if (minutes > 0 && days === 0) parts.push(`${minutes} นาที`);

      return `${prefix} ${parts.join(' ')}`;
    };

    if (msToEnd <= 0) {
      return { text: formatDuration(msToEnd, 'เกินกำหนดเวลา'), state: 'overdue' };
    }

    return { text: `เหลือเวลา: ${formatDuration(msToEnd, '')}`, state: 'ongoing' };
  } catch {
    return { text: 'ข้อมูลเวลาไม่ถูกต้อง', state: 'error' };
  }
};