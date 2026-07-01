import dayjs from "dayjs"

/**
 * 获取当前完整日期字符串
 * 格式：YYYY-MM-DD HH:mm 星期X 农历 X月X
 */
export function getNowFullDate() {
  const now = dayjs()
  // 公历部分：2026-07-01 16:54
  const dateTime = now.format('YYYY-MM-DD HH:mm')
  // 中文星期：星期三
  const week = now.format('dddd')
  // 农历：五月十七
  const lunarMonth = now.format('LM')
  const lunarDay = now.format('LD')
  const lunarStr = `农历${lunarMonth}${lunarDay}`
  return `${dateTime} ${week} ${lunarStr}`
}