// @flow

export function getFunctionResult(func: Function, parameters: Array<any>): any {
  const parametersLength = parameters.length
  // Get the result of invoking the function with the given parameters
  // Prefer .call to apply due to performance benefits

  if (parametersLength === 1) {
    return func.call(this, parameters[0])
  } else if (parametersLength === 2) {
    return func.call(this, parameters[0], parameters[1])
  } else if (parametersLength === 3) {
    return func.call(this, parameters[0], parameters[1], parameters[2])
  } else if (parametersLength === 4) {
    return func.call(this, parameters[0], parameters[1], parameters[2], parameters[3])
  }
  return func.apply(this, parameters)
}
