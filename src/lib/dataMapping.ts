export default function (keys: any[], items: object[], getKeyCallback: (item: object) => any) {
  const map = {}
  for (const key of keys) {
    map[key] = null
  }

  for (const item of items) {
    const key = getKeyCallback(item)
    if (key) {
      map[key] = item
    }
  }
  return map
}
