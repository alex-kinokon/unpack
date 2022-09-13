interface Array<T> {
  filter(predicate: BooleanConstructor): Exclude<T, null | undefined | false | "" | 0>[];
}
