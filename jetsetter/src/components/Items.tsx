import Item from './Item';

export type Items = {
  title: string,
  items: Item[],
  onCheckOff: (item: Item) => void
  onDelete: (item: Item) => void
}

const Items = ({ title, items, onCheckOff, onDelete }: Items) => {
  return (
    <section className="items">
      <h2>{title}</h2>
      {
        items.map((item) => <Item key={item.id} onCheckOff={() => onCheckOff(item)} onDelete={ () => onDelete(item)} value={item.value} id={item.id} packed={item.packed}></Item> )
      }
    </section>
  )
}

export default Items;