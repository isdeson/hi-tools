import Pinyin from 'tiny-pinyin'

/**
 * 获取字符串的拼音全拼（小写无空格）
 */
function getFullPinyin(str: string): string {
  if (!Pinyin.isSupported()) return str.toLowerCase()
  return Pinyin.convertToPinyin(str, '', true).toLowerCase()
}

/**
 * 获取字符串的拼音首字母（小写）
 */
function getInitials(str: string): string {
  if (!Pinyin.isSupported()) return str.toLowerCase()

  let result = ''
  for (const char of str) {
    if (Pinyin.isSupported() && /[\u4e00-\u9fa5]/.test(char)) {
      const pinyin = Pinyin.convertToPinyin(char, '', true)
      result += pinyin.charAt(0)
    } else {
      result += char
    }
  }
  return result.toLowerCase()
}

/**
 * 判断目标文本是否匹配搜索关键词
 * 支持：原文、拼音全拼、拼音首字母
 */
export function matchPinyin(text: string, keyword: string): boolean {
  if (!keyword) return true

  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()

  // 原文匹配
  if (lowerText.includes(lowerKeyword)) return true

  // 拼音全拼匹配
  const fullPinyin = getFullPinyin(text)
  if (fullPinyin.includes(lowerKeyword)) return true

  // 拼音首字母匹配
  const initials = getInitials(text)
  if (initials.includes(lowerKeyword)) return true

  return false
}
