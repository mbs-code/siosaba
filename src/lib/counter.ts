export default class Counter {
  ary: any[]
  pointer: number
  length: number

  constructor (ary: any[]) {
    this.ary = ary
    this.pointer = 0
    this.length = ary.length
  }

  next () {
    const item = this.ary[this.pointer]
    this.pointer++
  }

  contain () {
    
  }
}
