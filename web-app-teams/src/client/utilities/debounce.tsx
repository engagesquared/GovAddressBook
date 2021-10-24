import * as React from "react";
export function debounce<T>(input: T, time = 500) {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(input);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(input);
    }, time);

    return () => {
      clearTimeout(timeout);
    };
  }, [input, time]);

  return debouncedValue;
}
