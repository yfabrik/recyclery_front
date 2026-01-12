import { DAYS_OF_WEEK } from '../../interfaces/shared';
import WeekViewSections from './WeekViewSections';

const meta = {
  component: WeekViewSections,
  
};

export default meta;

export const Default = {
  args:{
    filteredSchedules:[],
    collections:[],
    weekDays:DAYS_OF_WEEK,
    day: new Date()

  }
};