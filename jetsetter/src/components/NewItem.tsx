import { useState } from 'react';
import type Item from './Item'

const NewItem = ({ onSubmit }: {onSubmit: (item: Item ) => void}) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setValue(value);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ value, packed: false } as Item)
    setValue('');
  }
  return (
    <form className="new-Item" onSubmit={handleSubmit}>
      <input className="new-item-input" type="text" value={value} onChange={handleChange} />
      <input className="new-iten-submit button" type="submit" />
    </form>
  )
}

export default NewItem;