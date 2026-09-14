// src/components/listings/Sidebar.jsx
import CategoryTree from './CategoryTree';

export default function Sidebar({ activeCategory, activeSub, onCategory, onSub }) {
  return (
    <aside className="lp-sidebar">
      <CategoryTree
        activeCategory={activeCategory}
        activeSub={activeSub}
        onCategory={onCategory}
        onSub={onSub}
      />
    </aside>
  );
}