import { usePantryStore } from './components/use_pantry_db';
import { ItemCard } from './components/item_card';
import { useItemFilter } from './components/use_item_filter';
import { Header } from './components/header';
import { Footer } from './components/footer';
import { ActionBar } from './components/action_bar';

export function App() {
  const pantry = usePantryStore();
  const filter = useItemFilter(pantry.items);

  return (
    <>
      <div className="container">
        <Header />
        {/* The search bar and filters */}
        <div className="card" style={{ marginBottom: 12 }}>
          {filter.Widget}
        </div>
        {/* The action bar, with a summary of contents. */}
        <ActionBar items={filter.items} pantry={pantry} />
        {/* The raw contents. */}
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
