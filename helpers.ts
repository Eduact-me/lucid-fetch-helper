export function _omit(obj, omittingList: string[]) {
  if (typeof obj !== "object")
    throw new Error(
      `expecting first parameter to be of type 'object' instead found '${typeof obj}'`
    );

  if (!(omittingList instanceof Array))
    throw new Error(`expecting second parameter to be an 'Array'`);

  let cpdObj = { ...obj };
  omittingList.forEach((item) => delete cpdObj[item]);
  return cpdObj;
}
