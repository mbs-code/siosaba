/**
 * 値があるなら必ず配列にする.
 * @param val 値
 */
export default function (val: any): any[]|undefined {
  if (val) {
    if (Array.isArray(val)) {
      return val
    } else {
      return [val]
    }
  }
  return val
}
