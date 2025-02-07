import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {MILLISECONDS_IN_A_DAY, MILLISECONDS_IN_AN_HOUR, MILLISECONDS_IN_A_MINUTE} from '../constants/time-constants';

dayjs.extend(duration);

export function formatDate(dateString) {
  return dayjs(dateString).format('MMM DD');
}

export function formatTime(dateString) {
  return dayjs(dateString).format('HH:mm');
}

export function formatDuration(startDate, endDate) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const timeFrame = end.diff(start);

  const days = Math.floor(timeFrame / MILLISECONDS_IN_A_DAY);
  const hours = Math.floor((timeFrame % MILLISECONDS_IN_A_DAY) / MILLISECONDS_IN_AN_HOUR);
  const minutes = Math.floor((timeFrame % MILLISECONDS_IN_AN_HOUR) / MILLISECONDS_IN_A_MINUTE);


  if (days > 0) {
    return `${days}D ${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  } else if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
  } else {
    return `${minutes}M`;
  }
}
