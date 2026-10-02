import { useState, useEffect } from 'react';
import Items from './components/Items'
import type Item from './components/Item';
import NewItem from './components/NewItem';
import type { DatabaseOption } from './idatabase'
// import './App.css'
import './base.scss';

function App({ database } : {database: DatabaseOption}) {
  const [items, setItems] = useState<Item[]>([])

  const fetchItems = async () => {
    const fitems: Item[] = await database.getAll();
    console.log(items, 'items');
    // const fitems = await database('items').select();
    setItems(fitems);
  }

  useEffect(() => {
    fetchItems();
  }, []);


  const addItem = async (item: Item) => {
    console.log(item, 'addItem')
    await database.addItem(item);
    // await database('items').insert(item);
    await fetchItems();
    // setItems([...items, item]);
  }

  const markAsPacked = async (item: Item) => {
    console.log('item:', item);
    // await database('items').where('id', '=', item.id).update({ packed: !item.packed });
    // const otherItems = items.filter(other => other.id !== item.id);
    const updateItem = { ...item, packed: !item.packed };
    await database.updateItem(updateItem);
    await fetchItems();
    // setItems([updateItem, ...otherItems])
  }

  const markAllAsPacked = async () => {
    // await database('items').select().update({
    //   packed: false
    // });
    await database.markAllAsUnpacked();
    await fetchItems();
    // const updateItems = items.map((item) => ({ ...item, packed: false }));
    // setItems(updateItems);
  }

  const deleteItem = async (item: Item) => {
    await database.deleteItem(item);
    // await database('items').where('id', item.id).delete();
    await fetchItems();
  }

  const deleteUnpackedItem = async () => {
    await database.deleteUnpackedItems();
    // await database('items').where('packed', false).delete();
    await fetchItems();
  }

  const unpackedItems = items.filter(({ packed }) => !packed);
  const packedItems =  items.filter(({ packed }) => packed);

  return (
    <>
      <div className="application">
        <NewItem onSubmit={addItem}/>
        <Items title={'未打包'} items={unpackedItems} onCheckOff={markAsPacked} onDelete={deleteItem}></Items>
        <Items title={'已打包'} items={packedItems} onCheckOff={markAsPacked} onDelete={deleteItem}></Items>
        <button className='full-width' onClick={markAllAsPacked}>
          标记所有未装包
        </button>
        <button className="button full-width secondary" onClick={deleteUnpackedItem}>Remove Unpacked Item</button>
      </div>
    </>
  )
}

export default App
