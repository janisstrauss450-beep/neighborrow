import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  Armchair,
  Baby,
  BadgeDollarSign,
  Car,
  ChevronRight,
  CreditCard,
  Drill,
  Grid2X2,
  Hammer,
  HeartHandshake,
  Home,
  Leaf,
  MapPin,
  MessageCircle,
  Moon,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Star,
  Sun,
  User,
  Wallet,
  WashingMachine,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Tab = 'home' | 'search' | 'add' | 'chats' | 'profile'
type Theme = 'light' | 'dark'
type Category = 'Tools' | 'Everyday' | 'Kids' | 'Furniture' | 'Repair' | 'Caregiving' | 'Garden' | 'Transport'
type ListingKind = 'lend' | 'rent' | 'request' | 'skill'
type MessageAuthor = 'me' | 'them' | 'system'
type PaymentMethod = 'visa' | 'mastercard' | 'google-pay' | 'apple-pay' | 'paypal'

type Neighbor = {
  id: string
  name: string
  avatar: string
  address: string
  rating: number
  verified?: boolean
  online?: boolean
}

type Listing = {
  id: string
  title: string
  ownerId: string
  category: Category
  kind: ListingKind
  description: string
  location: string
  price: string
  schedule: string
  distance: string
  status: 'available' | 'booked' | 'open'
}

type ChatMessage = {
  id: string
  author: MessageAuthor
  text: string
  time: string
}

type ChatThread = {
  id: string
  neighborId: string
  listingId?: string
  unread: number
  messages: ChatMessage[]
}

type Review = {
  id: string
  fromId: string
  rating: number
  text: string
}

type AppState = {
  listings: Listing[]
  favorites: string[]
  chats: ChatThread[]
}

type DraftListing = {
  kind: ListingKind
  category: Category
  title: string
  description: string
  location: string
  price: string
  schedule: string
}

const STORAGE_KEY = 'neighborrow:v1'

const neighbors: Neighbor[] = [
  {
    id: 'anna',
    name: 'Anna',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80',
    address: 'Brown street 14',
    rating: 4.9,
    verified: true,
    online: true,
  },
  {
    id: 'mike',
    name: 'Mike',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=180&q=80',
    address: 'Oak lane 8',
    rating: 4.7,
    verified: true,
  },
  {
    id: 'linda',
    name: 'Linda T.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80',
    address: 'Elm street 23',
    rating: 5,
    verified: true,
    online: true,
  },
  {
    id: 'john',
    name: 'John B.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80',
    address: 'Maple court 5',
    rating: 4.8,
  },
  {
    id: 'amanda',
    name: 'Amanda White',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&q=80',
    address: 'Elm street 19',
    rating: 5,
    verified: true,
  },
]

const seedListings: Listing[] = [
  {
    id: 'shelf-help',
    title: 'Help with hanging up a shelf',
    ownerId: 'anna',
    category: 'Repair',
    kind: 'request',
    description: 'Need a steady hand and a drill for one wall shelf in the hallway.',
    location: 'Brown street 14',
    price: 'Neighbor favor',
    schedule: 'Today, 14:00 - 15:00',
    distance: '0.2 km',
    status: 'open',
  },
  {
    id: 'electric-grill',
    title: 'Borrow electric grill',
    ownerId: 'mike',
    category: 'Everyday',
    kind: 'request',
    description: 'Looking for a clean tabletop electric grill for a small dinner.',
    location: 'Oak lane 8',
    price: 'Can trade plant care',
    schedule: 'Today, 19:00 - 21:30',
    distance: '0.4 km',
    status: 'open',
  },
  {
    id: 'dewalt-drill',
    title: 'DeWalt hand drill',
    ownerId: 'amanda',
    category: 'Tools',
    kind: 'rent',
    description: 'Cordless drill with bits, charged battery, and small level included.',
    location: 'Elm street 19',
    price: '2 EUR/h',
    schedule: '13 - 28 Feb.',
    distance: '0.6 km',
    status: 'available',
  },
  {
    id: 'kids-chair',
    title: 'Wooden kids chair',
    ownerId: 'linda',
    category: 'Kids',
    kind: 'lend',
    description: 'Sturdy small chair for weekend guests or a birthday party.',
    location: 'Elm street 23',
    price: 'Free',
    schedule: 'This weekend',
    distance: '0.7 km',
    status: 'available',
  },
  {
    id: 'pet-sitting',
    title: 'Evening pet and child check-in',
    ownerId: 'linda',
    category: 'Caregiving',
    kind: 'skill',
    description: 'Short evening check-ins for pets, plants, or older kids nearby.',
    location: 'Elm street 23',
    price: '8 EUR/visit',
    schedule: 'Weekdays after 18:00',
    distance: '0.7 km',
    status: 'available',
  },
  {
    id: 'garden-ladder',
    title: 'Folding garden ladder',
    ownerId: 'john',
    category: 'Garden',
    kind: 'lend',
    description: 'Lightweight ladder, good for pruning and outdoor lamps.',
    location: 'Maple court 5',
    price: 'Free',
    schedule: 'Available tomorrow',
    distance: '0.9 km',
    status: 'available',
  },
]

const seedChats: ChatThread[] = [
  {
    id: 'chat-anna',
    neighborId: 'anna',
    listingId: 'dewalt-drill',
    unread: 1,
    messages: [
      {
        id: 'm1',
        author: 'them',
        text: 'Hi! I saw your post about helping with hanging a shelf. Is the 2pm time still available?',
        time: '11:28',
      },
      { id: 'm2', author: 'me', text: 'Hi Anna! Yes, it is still available.', time: '11:29' },
      { id: 'm3', author: 'them', text: "Great! I'll see you then. Should I bring anything?", time: '11:29' },
      { id: 'm4', author: 'me', text: 'No, I have everything we need. Thanks!', time: '11:30' },
      { id: 'm5', author: 'them', text: "Hi! I'm still good to come at 2pm today.", time: '11:30' },
    ],
  },
  {
    id: 'chat-john',
    neighborId: 'john',
    listingId: 'dewalt-drill',
    unread: 0,
    messages: [
      { id: 'j1', author: 'them', text: 'Thanks again for letting me borrow the drill!', time: '10:15' },
    ],
  },
  {
    id: 'chat-linda',
    neighborId: 'linda',
    listingId: 'kids-chair',
    unread: 2,
    messages: [{ id: 'l1', author: 'them', text: 'Perfect, see you then!', time: 'Yesterday' }],
  },
  {
    id: 'chat-team',
    neighborId: 'amanda',
    unread: 0,
    messages: [
      { id: 't1', author: 'system', text: 'Important update: New safety tips when meeting neighbors', time: 'Mon' },
    ],
  },
]

const reviews: Review[] = [
  {
    id: 'r1',
    fromId: 'linda',
    rating: 5,
    text: 'Amanda was very polite and responsive, lent me her hand drill. Good experience!',
  },
]

const categories: Category[] = ['Tools', 'Everyday', 'Kids', 'Furniture', 'Repair', 'Caregiving', 'Garden', 'Transport']

const emptyDraft: DraftListing = {
  kind: 'lend',
  category: 'Tools',
  title: '',
  description: '',
  location: 'Elm street 19',
  price: 'Free',
  schedule: 'Today',
}

function loadState(): AppState {
  const fallback = { listings: seedListings, favorites: ['dewalt-drill'], chats: seedChats }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function getNeighbor(id: string) {
  return neighbors.find((neighbor) => neighbor.id === id) ?? neighbors[0]
}

function stars(count: number) {
  return Array.from({ length: 5 }, (_, index) => (index < Math.round(count) ? '★' : '☆')).join('')
}

function nowTime() {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date())
}

function isPaidListing(listing: Listing) {
  return listing.kind === 'rent' || listing.kind === 'skill' || /\d/.test(listing.price)
}

function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('neighborrow:theme') === 'dark' ? 'dark' : 'light'))
  const [tab, setTab] = useState<Tab>('home')
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All')
  const [query, setQuery] = useState('')
  const [activeChatId, setActiveChatId] = useState('chat-anna')
  const [messageDraft, setMessageDraft] = useState('')
  const [form, setForm] = useState<DraftListing>(emptyDraft)
  const [notice, setNotice] = useState<string | null>(null)
  const [checkoutListing, setCheckoutListing] = useState<Listing | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('google-pay')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('neighborrow:theme', theme)
  }, [theme])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const filteredListings = useMemo(() => {
    return state.listings.filter((listing) => {
      const matchesCategory = activeCategory === 'All' || listing.category === activeCategory
      const search = `${listing.title} ${listing.description} ${listing.location} ${listing.category}`.toLowerCase()
      return matchesCategory && search.includes(query.toLowerCase())
    })
  }, [activeCategory, query, state.listings])

  const activeChat = state.chats.find((chat) => chat.id === activeChatId) ?? state.chats[0]
  const activeListing = activeChat?.listingId ? state.listings.find((listing) => listing.id === activeChat.listingId) : undefined

  function toggleFavorite(listingId: string) {
    setState((current) => ({
      ...current,
      favorites: current.favorites.includes(listingId)
        ? current.favorites.filter((id) => id !== listingId)
        : [...current.favorites, listingId],
    }))
  }

  function openChat(listing: Listing) {
    const existing = state.chats.find((chat) => chat.neighborId === listing.ownerId && chat.listingId === listing.id)
    if (existing) {
      setActiveChatId(existing.id)
    } else {
      const neighbor = getNeighbor(listing.ownerId)
      const thread: ChatThread = {
        id: `chat-${listing.id}-${Date.now()}`,
        neighborId: neighbor.id,
        listingId: listing.id,
        unread: 0,
        messages: [
          {
            id: `msg-${Date.now()}`,
            author: 'system',
            text: `Conversation started about "${listing.title}".`,
            time: nowTime(),
          },
        ],
      }
      setState((current) => ({ ...current, chats: [thread, ...current.chats] }))
      setActiveChatId(thread.id)
    }
    setTab('chats')
  }

  function openThread(chatId: string) {
    setActiveChatId(chatId)
    setState((current) => ({
      ...current,
      chats: current.chats.map((chat) => (chat.id === chatId ? { ...chat, unread: 0 } : chat)),
    }))
  }

  function startDirectChat(neighborId: string) {
    const existing = state.chats.find((chat) => chat.neighborId === neighborId && !chat.listingId)
    if (existing) {
      openThread(existing.id)
      return existing.id
    }

    const neighbor = getNeighbor(neighborId)
    const id = `chat-${neighborId}-${Date.now()}`
    const thread: ChatThread = {
      id,
      neighborId,
      unread: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          author: 'system',
          text: `New neighbor chat with ${neighbor.name}. Share timing, pickup details, or safety questions here.`,
          time: nowTime(),
        },
      ],
    }
    setState((current) => ({ ...current, chats: [thread, ...current.chats] }))
    setActiveChatId(id)
    return id
  }

  function requestListing(listing: Listing) {
    if (listing.status === 'booked') {
      openChat(listing)
      setNotice('Request already sent - chat opened')
      return
    }
    if (isPaidListing(listing)) {
      setCheckoutListing(listing)
      return
    }
    openChat(listing)
    setState((current) => ({
      ...current,
      listings: current.listings.map((item) => (item.id === listing.id ? { ...item, status: 'booked' } : item)),
    }))
    setNotice('Request saved and chat opened')
  }

  function completeCheckout() {
    if (!checkoutListing) return
    const listing = checkoutListing
    openChat(listing)
    setState((current) => ({
      ...current,
      listings: current.listings.map((item) => (item.id === listing.id ? { ...item, status: 'booked' } : item)),
      chats: current.chats.map((chat) =>
        chat.neighborId === listing.ownerId && chat.listingId === listing.id
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: `pay-${Date.now()}`,
                  author: 'system',
                  text: `Payment hold created with ${paymentMethodLabel(paymentMethod)}. The host is notified; funds release after pickup is confirmed.`,
                  time: nowTime(),
                },
              ],
            }
          : chat,
      ),
    }))
    setCheckoutListing(null)
    setNotice('Payment hold created and chat opened')
  }

  function sendMessage() {
    const text = messageDraft.trim()
    if (!text || !activeChat) return
    setState((current) => ({
      ...current,
      chats: current.chats.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              unread: 0,
              messages: [...chat.messages, { id: `msg-${Date.now()}`, author: 'me', text, time: nowTime() }],
            }
          : chat,
      ),
    }))
    setMessageDraft('')
  }

  function addListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = form.title.trim()
    const description = form.description.trim()
    if (!title || !description) {
      setNotice('Add a title and description first')
      return
    }

    const listing: Listing = {
      id: `listing-${Date.now()}`,
      title,
      description,
      ownerId: 'amanda',
      category: form.category,
      kind: form.kind,
      location: form.location,
      price: form.price,
      schedule: form.schedule,
      distance: 'You',
      status: form.kind === 'request' ? 'open' : 'available',
    }
    setState((current) => ({ ...current, listings: [listing, ...current.listings] }))
    setForm(emptyDraft)
    setQuery('')
    setActiveCategory('All')
    setTab('home')
    setNotice('Your post is live')
  }

  return (
    <main className="shell" aria-label="NeighBorrow prototype">
      <section className="phone">
        <Header theme={theme} onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))} />

        <div className="content">
          {tab === 'home' && (
            <HomeScreen
              listings={filteredListings}
              favorites={state.favorites}
              activeCategory={activeCategory}
              query={query}
              setQuery={setQuery}
              setActiveCategory={setActiveCategory}
              onFavorite={toggleFavorite}
              onRequest={requestListing}
              onChat={openChat}
              onBrowseSearch={() => setTab('search')}
            />
          )}

          {tab === 'search' && (
            <SearchScreen
              listings={filteredListings}
              favorites={state.favorites}
              activeCategory={activeCategory}
              query={query}
              setQuery={setQuery}
              setActiveCategory={setActiveCategory}
              onFavorite={toggleFavorite}
              onRequest={requestListing}
              onChat={openChat}
            />
          )}

          {tab === 'add' && <AddScreen form={form} setForm={setForm} onSubmit={addListing} />}

          {tab === 'chats' && (
            <ChatsScreen
              chats={state.chats}
              activeChat={activeChat}
              activeListing={activeListing}
              draft={messageDraft}
              setDraft={setMessageDraft}
              openThread={openThread}
              startDirectChat={startDirectChat}
              sendMessage={sendMessage}
            />
          )}

          {tab === 'profile' && <ProfileScreen listings={state.listings} favorites={state.favorites} />}
        </div>

        <BottomNav active={tab} onChange={setTab} unread={state.chats.reduce((total, chat) => total + chat.unread, 0)} />
      </section>
      {checkoutListing && (
        <CheckoutSheet
          listing={checkoutListing}
          method={paymentMethod}
          setMethod={setPaymentMethod}
          onClose={() => setCheckoutListing(null)}
          onConfirm={completeCheckout}
        />
      )}
      {notice && <div className="toast">{notice}</div>}
    </main>
  )
}

function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <header className="app-header">
      <LogoMark />
      <div className="wordmark">
        Neigh<span>Borrow</span>
      </div>
      <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  )
}

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 72 72" aria-hidden="true">
      <path className="logo-roof" d="M9 34 36 10l27 24" />
      <path className="logo-house" d="M18 31h36v28H18z" />
      <path className="logo-door" d="M31 43h10v16H31z" />
      <path className="logo-window" d="M24 37h8v8h-8zM40 37h8v8h-8z" />
    </svg>
  )
}

function paymentMethodLabel(method: PaymentMethod) {
  const labels: Record<PaymentMethod, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    'google-pay': 'Google Pay',
    'apple-pay': 'Apple Pay',
    paypal: 'PayPal',
  }
  return labels[method]
}

function checkoutMath(listing: Listing) {
  const amount = Number((listing.price.match(/\d+(?:[.,]\d+)?/)?.[0] ?? '0').replace(',', '.')) || 0
  const platformFee = amount > 0 ? Math.max(0.35, amount * 0.08) : 0
  const protection = amount > 0 ? Math.max(0.25, amount * 0.04) : 0
  return {
    amount,
    platformFee,
    protection,
    total: amount + platformFee + protection,
  }
}

function CheckoutSheet({
  listing,
  method,
  setMethod,
  onClose,
  onConfirm,
}: {
  listing: Listing
  method: PaymentMethod
  setMethod: (method: PaymentMethod) => void
  onClose: () => void
  onConfirm: () => void
}) {
  const owner = getNeighbor(listing.ownerId)
  const totals = checkoutMath(listing)
  const methods: Array<{ id: PaymentMethod; label: string; Icon: LucideIcon }> = [
    { id: 'google-pay', label: 'Google Pay', Icon: Wallet },
    { id: 'apple-pay', label: 'Apple Pay', Icon: Wallet },
    { id: 'visa', label: 'Visa', Icon: CreditCard },
    { id: 'mastercard', label: 'Mastercard', Icon: CreditCard },
    { id: 'paypal', label: 'PayPal', Icon: BadgeDollarSign },
  ]

  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label="Payment demo checkout">
      <section className="checkout-sheet">
        <div className="sheet-head">
          <div>
            <span>Demo checkout</span>
            <h2>{listing.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close checkout">
            <X size={22} />
          </button>
        </div>

        <div className="checkout-summary">
          <ListingArt listing={listing} small />
          <div>
            <strong>{owner.name}</strong>
            <p>{listing.price} - {listing.schedule}</p>
            <small>{listing.location}</small>
          </div>
        </div>

        <div className="payment-options">
          {methods.map(({ id, label, Icon }) => (
            <button key={id} className={method === id ? 'active' : ''} onClick={() => setMethod(id)}>
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="price-breakdown">
          <div><span>Rental/service hold</span><b>{totals.amount.toFixed(2)} EUR</b></div>
          <div><span>NeighBorrow fee, 8%</span><b>{totals.platformFee.toFixed(2)} EUR</b></div>
          <div><span>Protection fee, 4%</span><b>{totals.protection.toFixed(2)} EUR</b></div>
          <div className="total"><span>Total demo hold</span><b>{totals.total.toFixed(2)} EUR</b></div>
        </div>

        <div className="payment-model">
          <ShieldCheck size={21} />
          <p>
            Paid rentals and paid skills use a refundable hold. NeighBorrow can take a small service
            fee only on paid exchanges; free favors stay free and commission-free.
          </p>
        </div>

        <button className="primary-action" onClick={onConfirm}>
          Confirm with {paymentMethodLabel(method)}
        </button>
      </section>
    </div>
  )
}

function HomeScreen({
  listings,
  favorites,
  activeCategory,
  query,
  setQuery,
  setActiveCategory,
  onFavorite,
  onRequest,
  onChat,
  onBrowseSearch,
}: ListingScreenProps) {
  const requests = listings.filter((listing) => listing.kind === 'request')
  const offers = listings.filter((listing) => listing.kind !== 'request')

  return (
    <div className="screen-stack">
      <SearchBox value={query} onChange={setQuery} placeholder="What do you need help with?" />
      <SectionTitle
        title="Categories"
        onClick={() => {
          setActiveCategory('All')
          setQuery('')
        }}
      />
      <CategoryRail active={activeCategory} onSelect={setActiveCategory} />
      <SectionTitle title="Posts" onClick={onBrowseSearch} />
      <div className="cards">
        {[...requests, ...offers].slice(0, 5).map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            favorite={favorites.includes(listing.id)}
            onFavorite={() => onFavorite(listing.id)}
            onRequest={() => onRequest(listing)}
            onChat={() => onChat(listing)}
          />
        ))}
      </div>
    </div>
  )
}

type ListingScreenProps = {
  listings: Listing[]
  favorites: string[]
  activeCategory: Category | 'All'
  query: string
  setQuery: (value: string) => void
  setActiveCategory: (category: Category | 'All') => void
  onFavorite: (listingId: string) => void
  onRequest: (listing: Listing) => void
  onChat: (listing: Listing) => void
  onBrowseSearch?: () => void
}

function SearchScreen(props: ListingScreenProps) {
  const [kind, setKind] = useState<ListingKind | 'all'>('all')
  const visible = props.listings.filter((listing) => kind === 'all' || listing.kind === kind)

  return (
    <div className="screen-stack">
      <h1 className="page-title">Find nearby help</h1>
      <SearchBox value={props.query} onChange={props.setQuery} placeholder="Search tools, skills, furniture..." />
      <CategoryRail active={props.activeCategory} onSelect={props.setActiveCategory} compact />
      <div className="segmented" aria-label="Listing type filter">
        {(['all', 'lend', 'rent', 'request', 'skill'] as const).map((option) => (
          <button key={option} className={kind === option ? 'active' : ''} onClick={() => setKind(option)}>
            {option === 'all' ? 'All' : option}
          </button>
        ))}
      </div>
      <div className="cards tight">
        {visible.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            favorite={props.favorites.includes(listing.id)}
            onFavorite={() => props.onFavorite(listing.id)}
            onRequest={() => props.onRequest(listing)}
            onChat={() => props.onChat(listing)}
            compact
          />
        ))}
      </div>
    </div>
  )
}

function AddScreen({
  form,
  setForm,
  onSubmit,
}: {
  form: DraftListing
  setForm: (draft: DraftListing) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="screen-stack">
      <h1 className="page-title">Share something local</h1>
      <form className="add-form" onSubmit={onSubmit}>
        <label>
          Type
          <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as ListingKind })}>
            <option value="lend">Lend for free</option>
            <option value="rent">Rent out</option>
            <option value="request">Ask for help/item</option>
            <option value="skill">Offer a skill</option>
          </select>
        </label>
        <label>
          Category
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Category })}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Cordless drill or baby sitting" />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Add practical details, timing, and what a neighbor should know."
          />
        </label>
        <div className="form-grid">
          <label>
            Price
            <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          </label>
          <label>
            Time
            <input value={form.schedule} onChange={(event) => setForm({ ...form, schedule: event.target.value })} />
          </label>
        </div>
        <label>
          Location
          <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
        </label>
        <button className="primary-action" type="submit">
          Publish post
        </button>
      </form>
    </div>
  )
}

function ChatsScreen({
  chats,
  activeChat,
  activeListing,
  draft,
  setDraft,
  openThread,
  startDirectChat,
  sendMessage,
}: {
  chats: ChatThread[]
  activeChat?: ChatThread
  activeListing?: Listing
  draft: string
  setDraft: (value: string) => void
  openThread: (id: string) => void
  startDirectChat: (neighborId: string) => string
  sendMessage: () => void
}) {
  const [mode, setMode] = useState<'list' | 'thread'>('list')
  const [chatFilter, setChatFilter] = useState<'all' | 'unread'>('all')
  const [chatQuery, setChatQuery] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [listingDetailsOpen, setListingDetailsOpen] = useState(false)
  const neighbor = activeChat ? getNeighbor(activeChat.neighborId) : neighbors[0]
  const visibleChats = chats.filter((chat) => {
    const person = getNeighbor(chat.neighborId)
    const last = chat.messages[chat.messages.length - 1]?.text ?? ''
    const matchesFilter = chatFilter === 'all' || chat.unread > 0
    const matchesSearch = `${person.name} ${last}`.toLowerCase().includes(chatQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (mode === 'thread' && activeChat) {
    return (
      <div className="chat-thread">
        <div className="thread-top">
          <button className="icon-button" onClick={() => setMode('list')} aria-label="Back to chats">
            <ArrowLeft size={23} />
          </button>
          <img src={neighbor.avatar} alt="" />
          <div>
            <strong>{neighbor.name}</strong>
            <span>{neighbor.online ? 'Online' : 'Usually replies today'}</span>
          </div>
        </div>
        {activeListing && (
          <button className="thread-listing" onClick={() => setListingDetailsOpen((value) => !value)}>
            <ListingArt listing={activeListing} small />
            <div>
              <strong>{activeListing.title}</strong>
              <span>{activeListing.schedule}</span>
              <span>{activeListing.price}</span>
            </div>
            <ChevronRight className="chevron" size={27} />
          </button>
        )}
        {activeListing && listingDetailsOpen && (
          <div className="thread-details">
            <strong>Exchange details</strong>
            <p>{activeListing.description}</p>
            <span>{activeListing.location} - {activeListing.distance}</span>
            <span>Status: {activeListing.status === 'booked' ? 'request sent' : activeListing.status}</span>
          </div>
        )}
        <span className="day-divider">Today</span>
        <div className="messages">
          {activeChat.messages.map((message) => (
            <div key={message.id} className={`message ${message.author}`}>
              {message.author === 'them' && <img src={neighbor.avatar} alt="" />}
              <p>{message.text}</p>
              <time>{message.time}</time>
            </div>
          ))}
        </div>
        <div className="composer">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message..."
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendMessage()
            }}
          />
          <button onClick={sendMessage} aria-label="Send message">
            <Send size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-stack">
      <div className="chat-head">
        <h1 className="page-title">Chats</h1>
        <button className="compose-button" aria-label="New chat" onClick={() => setComposeOpen((value) => !value)}>
          <Pencil size={21} />
        </button>
      </div>
      <SearchBox value={chatQuery} onChange={setChatQuery} placeholder="Search chats" />
      <div className="chat-tabs">
        <button className={chatFilter === 'all' ? 'active' : ''} onClick={() => setChatFilter('all')}>
          All
        </button>
        <button className={chatFilter === 'unread' ? 'active' : ''} onClick={() => setChatFilter('unread')}>
          Unread
        </button>
      </div>
      {composeOpen && (
        <div className="compose-panel">
          <strong>Start a neighbor chat</strong>
          {neighbors
            .filter((person) => person.id !== 'amanda')
            .map((person) => (
              <button
                key={person.id}
                onClick={() => {
                  startDirectChat(person.id)
                  setComposeOpen(false)
                  setMode('thread')
                }}
              >
                <img src={person.avatar} alt="" />
                <span>
                  <b>{person.name}</b>
                  <small>{person.address} - {person.rating.toFixed(1)} rating</small>
                </span>
                <ChevronRight size={20} />
              </button>
            ))}
        </div>
      )}
      <div className="chat-list">
        {visibleChats.length === 0 && (
          <div className="empty-panel">
            <strong>No chats here</strong>
            <span>{chatFilter === 'unread' ? 'All messages are read.' : 'Try another search term.'}</span>
          </div>
        )}
        {visibleChats.map((chat) => {
          const person = getNeighbor(chat.neighborId)
          const last = chat.messages[chat.messages.length - 1]
          return (
            <button
              key={chat.id}
              className="chat-row"
              onClick={() => {
                openThread(chat.id)
                setMode('thread')
              }}
            >
              <img src={person.avatar} alt="" />
              <div>
                <strong>{person.name}</strong>
                <span>{last?.text}</span>
              </div>
              <time>{last?.time}</time>
              {chat.unread > 0 && <b>{chat.unread}</b>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ProfileScreen({ listings, favorites }: { listings: Listing[]; favorites: string[] }) {
  const amanda = getNeighbor('amanda')
  const myListings = listings.filter((listing) => listing.ownerId === 'amanda')
  type ProfilePanelId = 'reviews' | 'deals' | 'saved' | 'lent' | 'borrowed' | 'posts' | 'safe' | 'frugal'
  const [panel, setPanel] = useState<ProfilePanelId>('lent')
  const borrowedFromMe = [
    { title: 'DeWalt hand drill', person: 'John B.', detail: 'Returned yesterday - 5.0 review' },
    { title: 'Folding garden ladder', person: 'Linda T.', detail: 'Booked for Thursday - pickup 18:30' },
    { title: 'Tool bit set', person: 'Anna', detail: 'Pending confirmation - free lend' },
  ]
  const iBorrowed = [
    { title: 'Electric grill', person: 'Mike', detail: 'Today 19:00 - 21:30 - trade plant care' },
    { title: 'Kids party chair set', person: 'Linda T.', detail: 'This weekend - free' },
  ]
  const panelText: Record<ProfilePanelId, { title: string; rows: Array<{ title: string; person: string; detail: string }> }> = {
    reviews: { title: 'Reviews', rows: reviews.map((review) => ({ title: `${stars(review.rating)} ${getNeighbor(review.fromId).name}`, person: 'Recent feedback', detail: review.text })) },
    deals: { title: 'Completed deals', rows: borrowedFromMe.concat(iBorrowed).slice(0, 4) },
    saved: { title: 'Saved posts', rows: listings.filter((listing) => favorites.includes(listing.id)).map((listing) => ({ title: listing.title, person: getNeighbor(listing.ownerId).name, detail: `${listing.price} - ${listing.schedule}` })) },
    lent: { title: 'Borrowed from me', rows: borrowedFromMe },
    borrowed: { title: 'I borrowed', rows: iBorrowed },
    posts: { title: 'My active posts', rows: myListings.map((listing) => ({ title: listing.title, person: listing.category, detail: `${listing.price} - ${listing.schedule}` })) },
    safe: { title: 'Safe exchange badge', rows: [{ title: 'Verified identity', person: 'Safety', detail: 'Profile, location, and neighbor feedback have been checked for safer meetups.' }] },
    frugal: { title: 'Frugal lifestyle badge', rows: [{ title: 'Resource saver', person: 'Community', detail: '15 successful reuse deals helped avoid buying duplicate household items.' }] },
  }

  return (
    <div className="profile-screen">
      <div className="profile-card">
        <img className="profile-avatar" src={amanda.avatar} alt="" />
        <div>
          <h1>Amanda White</h1>
          <div className="rating-line">
            <span>{stars(amanda.rating)}</span> {amanda.rating.toFixed(1)}
          </div>
          <p className="location-pin">{amanda.address}</p>
          <button className="verified" onClick={() => setPanel('safe')}>Verified</button>
        </div>
      </div>
      <div className="stats-strip">
        <button className={panel === 'reviews' ? 'active' : ''} onClick={() => setPanel('reviews')}>21 Reviews</button>
        <button className={panel === 'deals' ? 'active' : ''} onClick={() => setPanel('deals')}>15 Deals</button>
        <button className={panel === 'saved' ? 'active' : ''} onClick={() => setPanel('saved')}>{favorites.length} Saved</button>
      </div>
      {['reviews', 'deals', 'saved', 'safe', 'frugal'].includes(panel) && <ProfileDetail data={panelText[panel]} />}
      <p className="bio">I want to help and share things that others do not have. I value living green and living sparingly.</p>
      <SectionTitle title="Borrowed and lent" onClick={() => setPanel('lent')} />
      <div className="history-list">
        <button className={panel === 'lent' ? 'active' : ''} onClick={() => setPanel('lent')}>Borrowed from me (15)<ChevronRight size={20} /></button>
        <button className={panel === 'borrowed' ? 'active' : ''} onClick={() => setPanel('borrowed')}>I borrowed (8)<ChevronRight size={20} /></button>
        <button className={panel === 'posts' ? 'active' : ''} onClick={() => setPanel('posts')}>My active posts ({myListings.length})<ChevronRight size={20} /></button>
      </div>
      {['lent', 'borrowed', 'posts'].includes(panel) && <ProfileDetail data={panelText[panel]} />}
      <SectionTitle title="Evaluations" onClick={() => setPanel('safe')} />
      <div className="badges">
        <button className={panel === 'safe' ? 'active' : ''} onClick={() => setPanel('safe')}>Shield Safe exchange</button>
        <button className={panel === 'frugal' ? 'active' : ''} onClick={() => setPanel('frugal')}>Frugal lifestyle</button>
      </div>
      <button className="review-card" onClick={() => setPanel('reviews')}>
        <img src={getNeighbor(reviews[0].fromId).avatar} alt="" />
        <div>
          <strong>{getNeighbor(reviews[0].fromId).name} <span>{stars(reviews[0].rating)}</span></strong>
          <p>{reviews[0].text}</p>
        </div>
      </button>
    </div>
  )
}

function ProfileDetail({ data }: { data: { title: string; rows: Array<{ title: string; person: string; detail: string }> } }) {
  return (
    <div className="profile-detail">
      <strong>{data.title}</strong>
      {data.rows.length === 0 ? (
        <p>No items yet. Save a post or publish one to fill this section.</p>
      ) : (
        data.rows.map((row) => (
          <article key={`${row.title}-${row.detail}`}>
            <span>{row.person}</span>
            <b>{row.title}</b>
            <p>{row.detail}</p>
          </article>
        ))
      )}
    </div>
  )
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="search-box">
      <Search size={20} strokeWidth={2.4} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function SectionTitle({ title, onClick }: { title: string; onClick?: () => void }) {
  return (
    <button className="section-title" type="button" onClick={onClick}>
      <h2>{title}</h2>
      <ChevronRight size={34} strokeWidth={3} />
    </button>
  )
}

function CategoryRail({
  active,
  onSelect,
  compact,
}: {
  active: Category | 'All'
  onSelect: (category: Category | 'All') => void
  compact?: boolean
}) {
  const icons: Record<Category | 'All', LucideIcon> = {
    All: Grid2X2,
    Tools: Drill,
    Everyday: WashingMachine,
    Kids: Baby,
    Furniture: Armchair,
    Repair: Hammer,
    Caregiving: HeartHandshake,
    Garden: Leaf,
    Transport: Car,
  }
  return (
    <div className={`category-rail ${compact ? 'compact' : ''}`}>
      <button className={active === 'All' ? 'active' : ''} onClick={() => onSelect('All')}>
        <span className="cat-icon all"><Grid2X2 size={28} /></span>
        <b>All</b>
      </button>
      {categories.map((category) => {
        const Icon = icons[category]
        return (
          <button key={category} className={active === category ? 'active' : ''} onClick={() => onSelect(category)}>
            <span className={`cat-icon ${category.toLowerCase()}`}><Icon size={29} strokeWidth={2.4} /></span>
            <b>{category}</b>
          </button>
        )
      })}
    </div>
  )
}

function ListingCard({
  listing,
  favorite,
  onFavorite,
  onRequest,
  onChat,
  compact,
}: {
  listing: Listing
  favorite: boolean
  onFavorite: () => void
  onRequest: () => void
  onChat: () => void
  compact?: boolean
}) {
  const owner = getNeighbor(listing.ownerId)
  return (
    <article className={`listing-card ${compact ? 'compact' : ''}`}>
      <div className="listing-top">
        <ListingArt listing={listing} />
        <div className="listing-copy">
          <div className="person-line">
            <strong>{owner.name}</strong>
            <img src={owner.avatar} alt="" />
          </div>
          <h3>{listing.title}</h3>
          <p>{listing.description}</p>
          <div className="meta-row">
            <span>{listing.schedule}</span>
            <span>{listing.distance}</span>
          </div>
        </div>
      </div>
      <div className="location-row">
        <MapPin size={20} fill="currentColor" />
        <span>{listing.location}</span>
        <button className={`star-button ${favorite ? 'saved' : ''}`} onClick={onFavorite} aria-label="Toggle favorite">
          <Star size={21} fill="currentColor" />
        </button>
      </div>
      <div className="card-actions">
        <span className={`kind-pill ${listing.kind}`}>{listing.kind}</span>
        <span className="price">{listing.price}</span>
        <button onClick={onChat}>Chat</button>
        <button className="primary-mini" onClick={onRequest}>
          {listing.kind === 'request' ? 'Offer help' : listing.status === 'booked' ? 'Requested' : 'Request'}
        </button>
      </div>
    </article>
  )
}

function ListingArt({ listing, small }: { listing: Listing; small?: boolean }) {
  const icons: Record<Category, LucideIcon> = {
    Tools: Drill,
    Everyday: WashingMachine,
    Kids: Baby,
    Furniture: Armchair,
    Repair: Hammer,
    Caregiving: HeartHandshake,
    Garden: Leaf,
    Transport: Car,
  }
  const Icon = icons[listing.category]
  return (
    <div className={`listing-art art-${listing.category.toLowerCase()} ${small ? 'small' : ''}`} aria-hidden="true">
      <Icon size={small ? 27 : 34} strokeWidth={2.2} />
      <span>{listing.category}</span>
    </div>
  )
}

function BottomNav({ active, onChange, unread }: { active: Tab; onChange: (tab: Tab) => void; unread: number }) {
  const items: Array<{ id: Tab; label: string; Icon: LucideIcon }> = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'search', label: 'Search', Icon: Search },
    { id: 'add', label: 'Add', Icon: Plus },
    { id: 'chats', label: 'Chats', Icon: MessageCircle },
    { id: 'profile', label: 'Profile', Icon: User },
  ]
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {items.map((item) => (
        <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onChange(item.id)}>
          <item.Icon size={25} strokeWidth={2.3} />
          {item.label}
          {item.id === 'chats' && unread > 0 && <b>{unread}</b>}
        </button>
      ))}
    </nav>
  )
}

export default App
