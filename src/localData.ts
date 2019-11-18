import Store from 'electron-store';

const store = new Store();

// Set data in store
export const setData = (data: any) => {
  // store.set(data);
};

// Get data in store
export const getData = (data: string) => {
  // return store.get(data, 0);
};

// Remove data in store
export const removeData = (data: string) => {
  // store.delete(data);
};
