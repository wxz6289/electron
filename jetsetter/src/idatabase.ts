import { openDB } from 'idb';
import type Item from './components/Item';


const database = await openDB('jetsetter', 1, {
  upgrade(db) {
    db.createObjectStore('items', {
      keyPath: 'id',
      autoIncrement: true
    });
  }
});

export async function getAll() {
  const tx = database.transaction('items');
  const items = [];
  for await (const cusor of tx.store) {
    items.push(cusor.value);
  }
  return items;
}

export async function addItem(item: Item) {
  const tx = database.transaction('items', 'readwrite');
  const store = tx.objectStore('items');
  await store.add(item);
  return tx.done;
}

export async function updateItem(item: Item) {
  const tx = database.transaction('items', 'readwrite');
  await tx.objectStore('items').put(item);
  return tx.done;
}

export async function deleteItem(item: Item) {
  const tx = database.transaction('items', 'readwrite');
  await tx.objectStore('items').delete(item.id);
  return tx.done;
}

export async function deleteUnpackedItems() {
  const items = await getAll();
  const newItems = items.filter((item) => !item.packed);
  const tx = database.transaction('items', 'readwrite');
  for (const item of newItems) {
    await tx.objectStore('items').delete(item.id);
  }
  return tx.done;
}

export async function markAllAsUnpacked() {
  const items = await getAll();
  const newItems = items.map((item) => ({ ...item, packed: false }));
  const tx = database.transaction('items', 'readwrite');
  for (const item of newItems) {
    await tx.objectStore('items').put(item);
  }
  return tx.done;
}

export interface DatabaseOption {
  getAll(): Promise<Item[]>,
  addItem(item: Item): Promise<void>,
  updateItem(item: Item): Promise<void>,
  deleteItem(item: Item): Promise<void>,
  deleteUnpackedItems(): Promise<void>,
  markAllAsUnpacked(): Promise<void>,
}
