declare module 'tiny-pinyin' {
  interface PinyinStatic {
    isSupported(): boolean
    convertToPinyin(str: string, separator?: string, lowerCase?: boolean): string
    parse(str: string): Array<{ type: number; source: string; target: string }>
  }

  const Pinyin: PinyinStatic
  export default Pinyin
}
