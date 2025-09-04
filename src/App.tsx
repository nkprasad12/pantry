import { useState } from 'react';
import { usePantryStore } from './components/use_pantry_db';
import { NewItemForm } from './components/new_item_form';
import { ItemCard } from './components/item_card';
import { useItemFilter } from './components/use_item_filter';
import { Header } from './components/header';
import { Footer } from './components/footer';

export function App() {
  const pantry = usePantryStore();
  const filter = useItemFilter(pantry.items);

  const [showAdd, setShowAdd] = useState(false);
  // Calculate summary info
  const totalCount = pantry.items.length;
  const lowCount = pantry.items.filter((i) => i.quantity <= (i.minThreshold ?? 0)).length;

  return (
    <>
      <div className="container">
        <Header />
        <div className="card" style={{ marginBottom: 12 }}>
          {filter.Widget}
        </div>

        <div
          className="row"
          style={{ marginBottom: 12, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <button
            className="ghost"
            onClick={() => setShowAdd((v) => !v)}
            aria-expanded={showAdd}
            aria-controls="add-item-form"
          >
            {showAdd ? 'Hide Add Item' : 'Add Item'}
          </button>
          {/* @ts-ignore */}
          {import.meta.env.DEV && (
            <button className="ghost" onClick={pantry.seedDemo}>
              Demo
            </button>
          )}
          <span className="muted" style={{ fontSize: 15 }}>
            {totalCount} item{totalCount === 1 ? '' : 's'}
            {lowCount > 0 && (
              <>
                {' '}
                | <span className="danger">{lowCount} low</span>
              </>
            )}
          </span>
        </div>

        {showAdd && (
          <div className="card" style={{ marginBottom: 12 }} id="add-item-form">
            <NewItemForm onSubmit={pantry.add} />
          </div>
        )}

        <div className="grid">
          {filter.items.map((i) => (
            <ItemCard key={i.id} item={i} onUpdate={pantry.edit} onDelete={pantry.remove} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
