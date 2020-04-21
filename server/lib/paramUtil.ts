const range = function (num: number, { min, max }: { min?: number, max?: number } = {}) {
  if (num) {
    if (max !== null && num > max) {
      return max
    } else if (min !== null && num < min) {
      return min
    }
  }
  return num
}

const inArray = function (val: string, { arrays }: { arrays?: string[] } = {}) {
  if (arrays && arrays.length) {
    if (val) {
      if (arrays.indexOf(val) >= 0) {
        return val
      }
    }
    return null
  }

  return val
}

export default {
  range,
  inArray
}
