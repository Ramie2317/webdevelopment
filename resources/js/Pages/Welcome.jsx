import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

const initialProducts = [
    { id: 'ST-2048', name: 'Canvas Utility Tote', category: 'Bags', location: 'A-03-12', stock: 128, reorder: 40, price: 34.5, updated: '12 min ago', color: '#b8cfaa', initials: 'CT' },
    { id: 'ST-2047', name: 'Ceramic Pour-over Set', category: 'Kitchen', location: 'B-01-08', stock: 7, reorder: 18, price: 52, updated: '28 min ago', color: '#e5c5a4', initials: 'CP' },
    { id: 'ST-2046', name: 'Linen Market Apron', category: 'Textiles', location: 'C-02-04', stock: 64, reorder: 24, price: 42, updated: '1 hr ago', color: '#d8b8b1', initials: 'LA' },
    { id: 'ST-2045', name: 'Brass Desk Bell', category: 'Accessories', location: 'A-01-02', stock: 0, reorder: 12, price: 28, updated: '2 hrs ago', color: '#e8d887', initials: 'DB' },
    { id: 'ST-2044', name: 'Wool Blend Throw', category: 'Textiles', location: 'C-04-01', stock: 19, reorder: 20, price: 88, updated: '3 hrs ago', color: '#b7c3cf', initials: 'WT' },
    { id: 'ST-2043', name: 'Amber Glass Bottle', category: 'Kitchen', location: 'B-02-11', stock: 92, reorder: 30, price: 24, updated: 'Yesterday', color: '#e0b488', initials: 'GB' },
];

const Icon = ({ name, size = 18, ...props }) => {
    const paths = {
        grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
        box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" /></>,
        cart: <><path d="M3 4h2l2.3 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 9H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
        chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 4 3 6-7" /></>,
        users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
        search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
        plus: <><path d="M12 5v14M5 12h14" /></>,
        down: <><path d="m7 10 5 5 5-5" /></>,
        arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
        download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
        filter: <><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /></>,
        bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
        close: <><path d="m18 6-12 12M6 6l12 12" /></>,
        clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    };

    return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name]}</svg>;
};

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function Welcome({ auth }) {
    const [products, setProducts] = useState(initialProducts);
    const [query, setQuery] = useState('');
    const [stockFilter, setStockFilter] = useState('All items');
    const [categoryFilter, setCategoryFilter] = useState('All categories');
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [notice, setNotice] = useState('');

    const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= product.reorder).length;
    const outOfStockCount = products.filter((product) => product.stock === 0).length;
    const inventoryValue = products.reduce((total, product) => total + product.stock * product.price, 0);
    const categories = [...new Set(products.map((product) => product.category))];
    const visibleProducts = useMemo(() => products.filter((product) => {
        const matchesQuery = `${product.name} ${product.id} ${product.category}`.toLowerCase().includes(query.toLowerCase());
        const matchesStock = stockFilter === 'All items'
            || (stockFilter === 'Low stock' && product.stock > 0 && product.stock <= product.reorder)
            || (stockFilter === 'Out of stock' && product.stock === 0);
        const matchesCategory = categoryFilter === 'All categories' || product.category === categoryFilter;

        return matchesQuery && matchesStock && matchesCategory;
    }), [products, query, stockFilter, categoryFilter]);

    const exportCsv = () => {
        const columns = ['SKU', 'Product', 'Category', 'Location', 'In stock', 'Reorder point', 'Unit price'];
        const rows = visibleProducts.map((product) => [product.id, product.name, product.category, product.location, product.stock, product.reorder, product.price]);
        const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'stockroom-inventory.csv';
        link.click();
        URL.revokeObjectURL(url);
        setNotice('Inventory export downloaded');
        window.setTimeout(() => setNotice(''), 2800);
    };

    const addProduct = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name').trim();
        const category = formData.get('category').trim();
        const stock = Number(formData.get('stock'));
        const price = Number(formData.get('price'));
        const id = `ST-${String(Date.now()).slice(-4)}`;

        setProducts((current) => [{
            id,
            name,
            category,
            location: 'Unassigned',
            stock,
            reorder: 10,
            price,
            updated: 'Just now',
            color: '#c7d5a7',
            initials: name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase(),
        }, ...current]);
        setShowAddProduct(false);
        setNotice(`${name} added to inventory`);
        window.setTimeout(() => setNotice(''), 2800);
    };

    const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

    return (
        <>
            <Head title="Inventory overview">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-[#f4f5f1] font-['Manrope'] text-[#202821] antialiased">
                <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col bg-[#1d2b24] text-white lg:flex">
                    <a href="#overview" className="flex h-[88px] items-center gap-3 border-b border-white/10 px-7">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-[#c7ed61] text-[#1d2b24]">
                            <Icon name="box" size={21} />
                        </span>
                        <span className="text-[17px] font-extrabold tracking-[0.01em]">stockroom<span className="text-[#c7ed61]">.</span></span>
                    </a>
                    <div className="px-5 pt-8">
                        <p className="mb-3 px-3 font-['DM_Mono'] text-[10px] uppercase tracking-[0.16em] text-white/40">Workspace</p>
                        <nav className="space-y-1" aria-label="Main navigation">
                            <a href="#overview" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white"><Icon name="grid" size={17} /> Overview</a>
                            <a href="#inventory" className="flex items-center gap-3 rounded-lg bg-[#c7ed61] px-3 py-2.5 text-sm font-bold text-[#1d2b24]"><Icon name="box" size={17} /> Inventory<span className="ml-auto rounded-md bg-[#1d2b24]/10 px-2 py-0.5 font-['DM_Mono'] text-[10px]">{products.length}</span></a>
                            <a href="#inventory" onClick={() => { setStockFilter('All items'); setQuery(''); }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white"><Icon name="cart" size={17} /> Orders</a>
                            <a href="#activity" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white"><Icon name="chart" size={17} /> Reports</a>
                            <a href="#suppliers" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white"><Icon name="users" size={17} /> Suppliers</a>
                        </nav>
                    </div>
                    <div className="mt-auto border-t border-white/10 p-5">
                        <div className="rounded-xl bg-white/[0.06] p-4">
                            <div className="flex items-center justify-between">
                                <span className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.12em] text-white/50">Warehouse A</span>
                                <span className="size-2 rounded-full bg-[#c7ed61]" />
                            </div>
                            <p className="mt-2 text-sm font-semibold">Portland, OR</p>
                            <p className="mt-1 text-xs text-white/45">Last synced 4 minutes ago</p>
                        </div>
                        <div className="mt-5 flex items-center gap-3 px-1">
                            <div className="flex size-9 items-center justify-center rounded-full bg-[#e2b89d] text-xs font-extrabold text-[#3d3028]">{auth?.user?.name?.slice(0, 1) || 'A'}</div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold">{auth?.user?.name || 'Alex Morgan'}</p>
                                <p className="mt-0.5 text-[11px] text-white/45">Store admin</p>
                            </div>
                            <Icon name="down" size={15} className="text-white/45" />
                        </div>
                    </div>
                </aside>

                <div className="lg:pl-[248px]">
                    <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#e4e7df] bg-[#f4f5f1]/95 px-5 backdrop-blur md:px-8 xl:px-10">
                        <div className="flex items-center gap-3 lg:hidden">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-[#1d2b24] text-[#c7ed61]"><Icon name="box" size={19} /></span>
                            <span className="text-[16px] font-extrabold">stockroom<span className="text-[#688533]">.</span></span>
                        </div>
                        <div className="hidden items-center gap-2 text-xs text-[#7a8279] lg:flex"><span>Workspace</span><span>/</span><span className="font-bold text-[#273229]">Inventory</span></div>
                        <div className="ml-auto flex items-center gap-2 sm:gap-3">
                            <label className="hidden h-10 w-60 items-center gap-2.5 rounded-lg border border-[#e1e4dc] bg-white px-3 text-[#788077] md:flex">
                                <Icon name="search" size={16} />
                                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search inventory..." className="w-full border-0 bg-transparent p-0 text-xs text-[#263029] placeholder:text-[#9da39a] focus:ring-0" />
                                <kbd className="rounded border border-[#e3e6de] px-1.5 py-0.5 font-['DM_Mono'] text-[9px] text-[#999f96]">/</kbd>
                            </label>
                            <button type="button" aria-label="Notifications" className="relative flex size-10 items-center justify-center rounded-lg border border-[#e1e4dc] bg-white text-[#5e685e] transition hover:bg-[#edf0e8]"><Icon name="bell" size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e37c58] ring-2 ring-white" /></button>
                            {auth?.user ? <Link href={route('dashboard')} className="hidden rounded-lg bg-[#1d2b24] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#33483a] sm:inline-flex">Dashboard</Link> : <Link href={route('login')} className="rounded-lg bg-[#1d2b24] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#33483a]">Log in</Link>}
                        </div>
                    </header>

                    <nav aria-label="Page sections" className="flex gap-5 overflow-x-auto border-b border-[#e4e7df] bg-white px-5 py-3 text-[11px] font-bold text-[#727c70] lg:hidden">
                        <a href="#overview" className="shrink-0 text-[#3f5831]">Overview</a>
                        <a href="#inventory" className="shrink-0">Products</a>
                        <a href="#activity" className="shrink-0">Stock movement</a>
                        <a href="#suppliers" className="shrink-0">Stock alerts</a>
                    </nav>

                    <main id="overview" className="inventory-grid mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-8 md:pt-10 xl:px-10">
                        <div className="motion-enter flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                            <div>
                                <p className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.15em] text-[#78826f]">{dateLabel} <span className="px-1.5 text-[#b4baaf]">/</span> Warehouse A</p>
                                <h1 className="mt-2 text-[27px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[32px]">Inventory overview</h1>
                                <p className="mt-2 text-sm text-[#737c72]">Here&apos;s what&apos;s happening with your stock today.</p>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <button type="button" onClick={exportCsv} aria-label="Export inventory" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#dfe3da] bg-white px-3.5 text-xs font-bold text-[#364139] transition hover:bg-[#f9faf7]"><Icon name="download" size={15} /> <span className="hidden sm:inline">Export</span></button>
                                <button type="button" onClick={() => setShowAddProduct(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#c7ed61] px-3.5 text-xs font-extrabold text-[#26321c] transition hover:bg-[#b9df54]"><Icon name="plus" size={16} /> Add product</button>
                            </div>
                        </div>

                        <section aria-label="Inventory metrics" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <article className="motion-enter rounded-xl border border-[#e5e8e0] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between"><p className="text-xs font-semibold text-[#7b8379]">Total products</p><span className="flex size-8 items-center justify-center rounded-lg bg-[#eff4e6] text-[#55722e]"><Icon name="box" size={16} /></span></div>
                                <div className="mt-4 flex items-end justify-between"><p className="text-[28px] font-extrabold leading-none tracking-[-0.04em]">{products.length.toLocaleString()}</p><span className="text-[11px] font-bold text-[#678b3d]">+8.2% <Icon name="arrow" size={11} className="inline" /></span></div>
                                <p className="mt-2 text-[11px] text-[#9aa096]">Compared to last month</p>
                            </article>
                            <article className="motion-enter motion-enter-delay-1 rounded-xl border border-[#e5e8e0] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between"><p className="text-xs font-semibold text-[#7b8379]">Inventory value</p><span className="flex size-8 items-center justify-center rounded-lg bg-[#edf2ed] text-[#4d6955] font-['DM_Mono'] text-xs">$</span></div>
                                <div className="mt-4 flex items-end justify-between"><p className="text-[28px] font-extrabold leading-none tracking-[-0.04em]">{formatCurrency(inventoryValue)}</p><span className="text-[11px] font-bold text-[#678b3d]">+4.6% <Icon name="arrow" size={11} className="inline" /></span></div>
                                <p className="mt-2 text-[11px] text-[#9aa096]">Across all active products</p>
                            </article>
                            <article className="motion-enter motion-enter-delay-2 rounded-xl border border-[#e5e8e0] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between"><p className="text-xs font-semibold text-[#7b8379]">Low stock</p><span className="flex size-8 items-center justify-center rounded-lg bg-[#fff3e8] text-[#c37937]"><Icon name="filter" size={16} /></span></div>
                                <div className="mt-4 flex items-end justify-between"><p className="text-[28px] font-extrabold leading-none tracking-[-0.04em]">{lowStockCount + outOfStockCount}</p><span className="text-[11px] font-bold text-[#be783a]">Needs attention</span></div>
                                <p className="mt-2 text-[11px] text-[#9aa096]">{lowStockCount} low <span className="px-1">·</span> {outOfStockCount} out of stock</p>
                            </article>
                            <article className="motion-enter motion-enter-delay-2 rounded-xl border border-[#e5e8e0] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between"><p className="text-xs font-semibold text-[#7b8379]">Incoming orders</p><span className="flex size-8 items-center justify-center rounded-lg bg-[#f2ece5] text-[#8a6747]"><Icon name="cart" size={16} /></span></div>
                                <div className="mt-4 flex items-end justify-between"><p className="text-[28px] font-extrabold leading-none tracking-[-0.04em]">12</p><span className="text-[11px] font-bold text-[#7c8178]">4 arriving today</span></div>
                                <p className="mt-2 text-[11px] text-[#9aa096]">Across 3 suppliers</p>
                            </article>
                        </section>

                        <section className="motion-enter motion-enter-delay-1 mt-6 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
                            <article id="activity" className="rounded-xl border border-[#e5e8e0] bg-white p-5 md:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div><h2 className="text-sm font-extrabold">Stock movement</h2><p className="mt-1 text-[11px] text-[#92998f]">Items received and dispatched</p></div>
                                    <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#e7e9e4] px-3 py-2 text-[10px] font-bold text-[#606a60]">Last 7 days <Icon name="down" size={13} /></button>
                                </div>
                                <div className="mt-6 flex h-[154px] items-end gap-2 border-b border-[#edf0e9] px-1 sm:gap-4">
                                    {[['M', 46, 26], ['T', 62, 34], ['W', 54, 42], ['T', 78, 48], ['F', 66, 37], ['S', 38, 23], ['S', 58, 32]].map(([day, received, dispatched], index) => <div key={`${day}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="flex h-[126px] w-full items-end justify-center gap-1 sm:gap-1.5"><div style={{ height: `${received}%` }} className="w-2.5 rounded-t-sm bg-[#c7ed61] sm:w-4" /><div style={{ height: `${dispatched}%` }} className="w-2.5 rounded-t-sm bg-[#dce2d5] sm:w-4" /></div><span className="pb-2 font-['DM_Mono'] text-[9px] text-[#9ba197]">{day}</span></div>)}
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-[10px] font-semibold text-[#81897f]"><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#c7ed61]" /> Received</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#dce2d5]" /> Dispatched</span><span className="ml-auto hidden font-['DM_Mono'] text-[#9ba197] sm:inline">+18% vs. prior week</span></div>
                            </article>
                            <article id="suppliers" className="rounded-xl border border-[#e5e8e0] bg-white p-5 md:p-6">
                                <div className="flex items-start justify-between"><div><h2 className="text-sm font-extrabold">Stock alerts</h2><p className="mt-1 text-[11px] text-[#92998f]">Products that need a restock</p></div><span className="rounded-md bg-[#fff3e8] px-2 py-1 font-['DM_Mono'] text-[10px] font-medium text-[#b46e36]">{lowStockCount + outOfStockCount} alerts</span></div>
                                <div className="mt-4 divide-y divide-[#eef0eb]">
                                    {products.filter((product) => product.stock <= product.reorder).slice(0, 3).map((product) => <div key={product.id} className="flex items-center gap-3 py-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg font-['DM_Mono'] text-[10px] font-medium text-[#485044]" style={{ backgroundColor: product.color }}>{product.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold">{product.name}</p><p className="mt-0.5 text-[10px] text-[#9ba197]">SKU {product.id}</p></div><div className="text-right"><p className={`font-['DM_Mono'] text-xs font-medium ${product.stock === 0 ? 'text-[#c25e49]' : 'text-[#bd783c]'}`}>{product.stock} left</p><p className="mt-0.5 text-[9px] text-[#9ba197]">Reorder at {product.reorder}</p></div></div>)}
                                    {lowStockCount + outOfStockCount === 0 && <p className="py-7 text-center text-xs text-[#81897f]">All products are above their reorder points.</p>}
                                </div>
                                <button type="button" onClick={() => { setStockFilter('Low stock'); document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' }); }} className="mt-1 text-[10px] font-extrabold text-[#536f35] hover:text-[#314522]">Review low stock <span aria-hidden="true">→</span></button>
                            </article>
                        </section>

                        <section id="inventory" className="mt-6 overflow-hidden rounded-xl border border-[#e5e8e0] bg-white">
                            <div className="flex flex-col gap-4 border-b border-[#e9ece5] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
                                <div><div className="flex items-center gap-2"><h2 className="text-sm font-extrabold">Products</h2><span className="rounded-md bg-[#f0f2ed] px-2 py-0.5 font-['DM_Mono'] text-[10px] text-[#737c72]">{visibleProducts.length}</span></div><p className="mt-1 text-[11px] text-[#92998f]">Manage and monitor your current stock</p></div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-lg border border-[#e4e7e0] px-2.5 text-[#8d958b] md:flex-none"><Icon name="search" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a product..." className="w-full border-0 bg-transparent p-0 text-[11px] text-[#283229] placeholder:text-[#a3a99f] focus:ring-0" /></label>
                                    <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-9 rounded-lg border border-[#e4e7e0] bg-white px-2.5 text-[10px] font-semibold text-[#5f685f] focus:border-[#9bab72] focus:ring-0"><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
                                    <button type="button" onClick={exportCsv} aria-label="Export visible products" className="flex size-9 items-center justify-center rounded-lg border border-[#e4e7e0] text-[#657064] transition hover:bg-[#f5f6f2]"><Icon name="download" size={15} /></button>
                                </div>
                            </div>
                            <div className="flex gap-1 overflow-x-auto border-b border-[#eef0eb] px-5 md:px-6">
                                {['All items', 'Low stock', 'Out of stock'].map((filter) => <button key={filter} type="button" onClick={() => setStockFilter(filter)} className={`relative shrink-0 px-3 py-3 text-[10px] font-bold transition ${stockFilter === filter ? 'text-[#283229] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-[#799b42]' : 'text-[#90978d] hover:text-[#465147]'}`}>{filter}<span className={`ml-1.5 font-['DM_Mono'] text-[9px] ${stockFilter === filter ? 'text-[#6f8c43]' : 'text-[#aeb4aa]'}`}>{filter === 'All items' ? products.length : filter === 'Low stock' ? lowStockCount : outOfStockCount}</span></button>)}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] border-collapse text-left">
                                    <thead><tr className="bg-[#fafbf8] font-['DM_Mono'] text-[9px] uppercase tracking-[0.08em] text-[#969e93]"><th className="px-6 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">SKU</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Location</th><th className="px-4 py-3 font-medium">In stock</th><th className="px-4 py-3 font-medium">Unit price</th><th className="px-6 py-3 text-right font-medium">Updated</th></tr></thead>
                                    <tbody className="divide-y divide-[#eff1ec]">
                                        {visibleProducts.map((product) => {
                                            const status = product.stock === 0 ? 'Out of stock' : product.stock <= product.reorder ? 'Low stock' : 'In stock';
                                            const statusClass = product.stock === 0 ? 'bg-[#fbece8] text-[#b65c49]' : product.stock <= product.reorder ? 'bg-[#fff3e7] text-[#b5763e]' : 'bg-[#edf4e6] text-[#65843f]';

                                            return <tr key={product.id} className="transition hover:bg-[#fbfcf9]"><td className="px-6 py-3.5"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg font-['DM_Mono'] text-[10px] font-medium text-[#485044]" style={{ backgroundColor: product.color }}>{product.initials}</span><span className="whitespace-nowrap text-[11px] font-bold text-[#343d35]">{product.name}</span></div></td><td className="px-4 py-3.5 font-['DM_Mono'] text-[10px] text-[#8b9389]">{product.id}</td><td className="px-4 py-3.5 text-[10px] text-[#687267]">{product.category}</td><td className="px-4 py-3.5 font-['DM_Mono'] text-[10px] text-[#788176]">{product.location}</td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><span className="font-['DM_Mono'] text-[11px] font-medium text-[#424b42]">{product.stock}</span><span className={`whitespace-nowrap rounded px-1.5 py-1 text-[8px] font-bold ${statusClass}`}>{status}</span></div></td><td className="px-4 py-3.5 font-['DM_Mono'] text-[10px] text-[#5c665b]">{formatCurrency(product.price)}</td><td className="px-6 py-3.5 text-right text-[10px] text-[#92998f]">{product.updated}</td></tr>;
                                        })}
                                        {visibleProducts.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-xs text-[#858d82]">No products match those filters.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex flex-col gap-2 border-t border-[#eef0eb] px-5 py-3.5 text-[10px] text-[#969e93] sm:flex-row sm:items-center sm:justify-between md:px-6"><span>Showing <strong className="text-[#545e53]">{visibleProducts.length}</strong> of <strong className="text-[#545e53]">{products.length}</strong> products</span><span className="inline-flex items-center gap-1.5"><Icon name="clock" size={13} /> Synced just now</span></div>
                        </section>
                        <footer className="mt-7 flex flex-col gap-2 text-[10px] text-[#a0a69d] sm:flex-row sm:items-center sm:justify-between"><span>Stockroom inventory <span className="px-1">·</span> Warehouse A</span><span>Data shown is sample inventory</span></footer>
                    </main>
                </div>
            </div>

            {showAddProduct && <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#152018]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAddProduct(false); }}>
                <section role="dialog" aria-modal="true" aria-labelledby="add-product-title" className="w-full max-w-[440px] rounded-xl bg-white p-6 shadow-2xl">
                    <div className="flex items-start justify-between"><div><h2 id="add-product-title" className="text-lg font-extrabold">Add a product</h2><p className="mt-1 text-xs text-[#838c81]">Add an item to this inventory view.</p></div><button type="button" onClick={() => setShowAddProduct(false)} aria-label="Close dialog" className="flex size-8 items-center justify-center rounded-lg text-[#7c857a] hover:bg-[#f2f4ef]"><Icon name="close" size={17} /></button></div>
                    <form onSubmit={addProduct} className="mt-5 space-y-4">
                        <label className="block text-xs font-bold text-[#515b50]">Product name<input required name="name" autoFocus className="mt-1.5 block w-full rounded-lg border border-[#dfe4da] px-3 py-2.5 text-sm font-medium focus:border-[#879d5b] focus:ring-[#879d5b]" placeholder="e.g. Ceramic serving bowl" /></label>
                        <label className="block text-xs font-bold text-[#515b50]">Category<input required name="category" className="mt-1.5 block w-full rounded-lg border border-[#dfe4da] px-3 py-2.5 text-sm font-medium focus:border-[#879d5b] focus:ring-[#879d5b]" placeholder="e.g. Kitchen" /></label>
                        <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold text-[#515b50]">Initial stock<input required name="stock" type="number" min="0" className="mt-1.5 block w-full rounded-lg border border-[#dfe4da] px-3 py-2.5 text-sm font-medium focus:border-[#879d5b] focus:ring-[#879d5b]" placeholder="0" /></label><label className="block text-xs font-bold text-[#515b50]">Unit price<input required name="price" type="number" min="0" step="0.01" className="mt-1.5 block w-full rounded-lg border border-[#dfe4da] px-3 py-2.5 text-sm font-medium focus:border-[#879d5b] focus:ring-[#879d5b]" placeholder="0.00" /></label></div>
                        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowAddProduct(false)} className="rounded-lg border border-[#dfe4da] px-4 py-2.5 text-xs font-bold text-[#5e685d] hover:bg-[#f7f8f5]">Cancel</button><button type="submit" className="rounded-lg bg-[#1d2b24] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#33483a]">Add product</button></div>
                    </form>
                </section>
            </div>}
            {notice && <div role="status" className="fixed bottom-5 right-5 z-40 rounded-lg bg-[#1d2b24] px-4 py-3 text-xs font-bold text-white shadow-xl">{notice}</div>}
        </>
    );
}