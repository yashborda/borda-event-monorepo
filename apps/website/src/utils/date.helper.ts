import dayjs from 'dayjs'

export const appDate = (date: string | Date): string =>
  dayjs(date).format('DD/MM/YYYY h:mm A')
