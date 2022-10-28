export function sortArr({ sortOrder, sortBy }) {
  return (a, b) => {
    const asc = sortOrder === 'asc';
    const aOrder = a[sortBy];
    const bOrder = b[sortBy];

    if (aOrder < bOrder) {
      return asc ? -1 : 1;
    }

    if (aOrder > bOrder) {
      return asc ? 1 : -1;
    }

    return 0;
  };
}
