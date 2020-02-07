import { useRef, useEffect } from 'react';

function usePrevious(value: string | number): string | number | undefined {
  const ref = useRef<string | number>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default usePrevious;
