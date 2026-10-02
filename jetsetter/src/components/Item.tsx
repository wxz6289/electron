type Item = {
  packed: boolean,
  id: number,
  value: string,
  onCheckOff: () => void,
  onDelete: () => void
}

const Item = ({ packed, value, onCheckOff, onDelete }: Item) => {
  return (
    <article className="item">
      <label htmlFor="">
        <input type="checkbox" checked={packed} onChange={onCheckOff} value={value} />
        {value}
      </label>
      <button className="delete" onClick={onDelete}>X</button>
    </article>
  );
}

export default Item