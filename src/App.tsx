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
  date: string
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
  {
    id: 'sara',
    name: 'Sara K.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80',
    address: 'Cedar walk 6',
    rating: 4.8,
    verified: true,
    online: true,
  },
  {
    id: 'tom',
    name: 'Tom R.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=180&q=80',
    address: 'Pine avenue 11',
    rating: 4.9,
    verified: true,
  },
  {
    id: 'eva',
    name: 'Eva M.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=180&q=80',
    address: 'River road 3',
    rating: 4.6,
  },
  {
    id: 'noah',
    name: 'Noah P.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=80',
    address: 'Willow yard 2',
    rating: 4.7,
    verified: true,
  },
  {
    id: 'priya',
    name: 'Priya S.',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=180&q=80',
    address: 'Market lane 17',
    rating: 5,
    verified: true,
    online: true,
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
  {
    id: 'pressure-washer',
    title: 'Compact pressure washer',
    ownerId: 'tom',
    category: 'Tools',
    kind: 'rent',
    description: 'Small patio washer with extension hose. Good for bikes, balconies, and garden tiles.',
    location: 'Pine avenue 11',
    price: '4 EUR/h',
    schedule: 'Today after 16:00',
    distance: '1.1 km',
    status: 'available',
  },
  {
    id: 'tool-bit-set',
    title: 'Mixed drill bit set',
    ownerId: 'sara',
    category: 'Tools',
    kind: 'lend',
    description: 'Wood, brick, and metal bits in a labeled case. Please return the same evening.',
    location: 'Cedar walk 6',
    price: 'Free',
    schedule: 'Available all week',
    distance: '0.5 km',
    status: 'available',
  },
  {
    id: 'stand-mixer',
    title: 'Stand mixer for baking',
    ownerId: 'priya',
    category: 'Everyday',
    kind: 'lend',
    description: 'Reliable mixer with dough hook and whisk. Perfect for birthday cakes or batch baking.',
    location: 'Market lane 17',
    price: 'Free',
    schedule: 'Saturday morning',
    distance: '1.2 km',
    status: 'available',
  },
  {
    id: 'carpet-cleaner',
    title: 'Carpet spot cleaner',
    ownerId: 'eva',
    category: 'Everyday',
    kind: 'rent',
    description: 'Handheld cleaner for rugs, sofas, and small spills. Includes half a bottle of solution.',
    location: 'River road 3',
    price: '6 EUR/day',
    schedule: 'Tomorrow',
    distance: '1.4 km',
    status: 'available',
  },
  {
    id: 'baby-travel-cot',
    title: 'Baby travel cot',
    ownerId: 'priya',
    category: 'Kids',
    kind: 'lend',
    description: 'Clean folding cot with fitted sheet, ideal for visiting family with a toddler.',
    location: 'Market lane 17',
    price: 'Free',
    schedule: 'Weekend pickup',
    distance: '1.2 km',
    status: 'available',
  },
  {
    id: 'lego-box',
    title: 'Rainy-day Lego box',
    ownerId: 'noah',
    category: 'Kids',
    kind: 'lend',
    description: 'Mixed bricks and wheels for a quiet afternoon. Best for ages 5 and up.',
    location: 'Willow yard 2',
    price: 'Free',
    schedule: 'Sunday afternoon',
    distance: '0.8 km',
    status: 'available',
  },
  {
    id: 'folding-table',
    title: 'Folding table for guests',
    ownerId: 'sara',
    category: 'Furniture',
    kind: 'lend',
    description: 'Light folding table that seats four. Easy to carry and fits in a hallway.',
    location: 'Cedar walk 6',
    price: 'Free',
    schedule: 'Friday to Sunday',
    distance: '0.5 km',
    status: 'available',
  },
  {
    id: 'office-chair',
    title: 'Ergonomic office chair',
    ownerId: 'tom',
    category: 'Furniture',
    kind: 'rent',
    description: 'Adjustable chair for a temporary work-from-home setup or visiting student.',
    location: 'Pine avenue 11',
    price: '10 EUR/week',
    schedule: 'Available Monday',
    distance: '1.1 km',
    status: 'available',
  },
  {
    id: 'bike-tuneup',
    title: 'Bike brake tune-up',
    ownerId: 'noah',
    category: 'Repair',
    kind: 'skill',
    description: 'I can adjust brake pads, tighten cables, and check tires in the courtyard.',
    location: 'Willow yard 2',
    price: 'Neighbor favor',
    schedule: 'Thursday evening',
    distance: '0.8 km',
    status: 'available',
  },
  {
    id: 'lamp-repair',
    title: 'Help rewiring a table lamp',
    ownerId: 'eva',
    category: 'Repair',
    kind: 'request',
    description: 'The lamp flickers and probably needs a new plug. I have the replacement part.',
    location: 'River road 3',
    price: 'Coffee and cake',
    schedule: 'This week',
    distance: '1.4 km',
    status: 'open',
  },
  {
    id: 'school-run-cover',
    title: 'School pickup backup',
    ownerId: 'priya',
    category: 'Caregiving',
    kind: 'request',
    description: 'Need a verified neighbor as backup pickup from the primary school next Tuesday.',
    location: 'Market lane 17',
    price: '15 EUR',
    schedule: 'Tuesday, 15:00',
    distance: '1.2 km',
    status: 'open',
  },
  {
    id: 'elder-checkin',
    title: 'Ten-minute elder check-in',
    ownerId: 'sara',
    category: 'Caregiving',
    kind: 'skill',
    description: 'Short friendly check-ins for older neighbors: groceries, bin day, or medication reminder.',
    location: 'Cedar walk 6',
    price: 'Free',
    schedule: 'Weekday mornings',
    distance: '0.5 km',
    status: 'available',
  },
  {
    id: 'seedling-tray',
    title: 'Tomato seedling tray',
    ownerId: 'eva',
    category: 'Garden',
    kind: 'lend',
    description: 'Reusable tray with small pots. Great if you are starting herbs or balcony tomatoes.',
    location: 'River road 3',
    price: 'Free',
    schedule: 'Pickup anytime',
    distance: '1.4 km',
    status: 'available',
  },
  {
    id: 'hedge-trimmer',
    title: 'Cordless hedge trimmer',
    ownerId: 'john',
    category: 'Garden',
    kind: 'rent',
    description: 'Charged trimmer with safety gloves. Best for small hedges and balcony greenery.',
    location: 'Maple court 5',
    price: '5 EUR/h',
    schedule: 'Saturday',
    distance: '0.9 km',
    status: 'available',
  },
  {
    id: 'cargo-bike',
    title: 'Cargo bike for errands',
    ownerId: 'noah',
    category: 'Transport',
    kind: 'rent',
    description: 'Front-box bike for groceries, plants, or small flat-pack furniture. Helmet included.',
    location: 'Willow yard 2',
    price: '7 EUR/h',
    schedule: 'Today until 20:00',
    distance: '0.8 km',
    status: 'available',
  },
  {
    id: 'airport-ride',
    title: 'Early airport ride share',
    ownerId: 'tom',
    category: 'Transport',
    kind: 'request',
    description: 'Looking to share a taxi or ride to the airport with one suitcase.',
    location: 'Pine avenue 11',
    price: 'Split fuel',
    schedule: 'Friday, 05:30',
    distance: '1.1 km',
    status: 'open',
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
  {
    id: 'chat-sara',
    neighborId: 'sara',
    listingId: 'folding-table',
    unread: 1,
    messages: [
      { id: 's1', author: 'them', text: 'The folding table is still free this weekend if you need it.', time: '09:42' },
      { id: 's2', author: 'me', text: 'That would be perfect. Could I pick it up Friday evening?', time: '09:45' },
      { id: 's3', author: 'them', text: 'Yes, after 18:00 works well.', time: '09:46' },
    ],
  },
  {
    id: 'chat-tom',
    neighborId: 'tom',
    listingId: 'pressure-washer',
    unread: 0,
    messages: [
      { id: 'to1', author: 'them', text: 'I can leave the pressure washer by the side gate at 16:30.', time: 'Yesterday' },
      { id: 'to2', author: 'me', text: 'Great, I will bring it back before 18:00.', time: 'Yesterday' },
    ],
  },
  {
    id: 'chat-priya',
    neighborId: 'priya',
    listingId: 'school-run-cover',
    unread: 3,
    messages: [
      { id: 'p1', author: 'them', text: 'Could you be my backup pickup next Tuesday?', time: '08:10' },
      { id: 'p2', author: 'them', text: 'The school office needs the name by tomorrow.', time: '08:12' },
      { id: 'p3', author: 'them', text: 'Happy to pay the listed amount or return the favor.', time: '08:12' },
    ],
  },
  {
    id: 'chat-noah',
    neighborId: 'noah',
    listingId: 'cargo-bike',
    unread: 0,
    messages: [
      { id: 'n1', author: 'system', text: 'Payment hold released after cargo bike return.', time: 'Tue' },
      { id: 'n2', author: 'them', text: 'Thanks for bringing it back charged and clean.', time: 'Tue' },
    ],
  },
  {
    id: 'chat-eva',
    neighborId: 'eva',
    listingId: 'lamp-repair',
    unread: 0,
    messages: [
      { id: 'e1', author: 'them', text: 'I found the replacement plug. Any evening works for me.', time: 'Mon' },
    ],
  },
]

const reviews: Review[] = [
  {
    id: 'r1',
    fromId: 'linda',
    rating: 5,
    date: '24 May 2026',
    text: 'Amanda was very polite and responsive, lent me her hand drill. Good experience!',
  },
  {
    id: 'r2',
    fromId: 'john',
    rating: 5,
    date: '22 May 2026',
    text: 'Clear pickup instructions and everything was ready on time. Would borrow again.',
  },
  {
    id: 'r3',
    fromId: 'anna',
    rating: 5,
    date: '20 May 2026',
    text: 'Amanda helped me sort out a shelf quickly and left the space tidy.',
  },
  {
    id: 'r4',
    fromId: 'sara',
    rating: 4,
    date: '18 May 2026',
    text: 'Friendly, fast replies, and very careful with shared items.',
  },
  {
    id: 'r5',
    fromId: 'tom',
    rating: 5,
    date: '15 May 2026',
    text: 'Smooth handoff and returned the item exactly when promised.',
  },
  {
    id: 'r6',
    fromId: 'priya',
    rating: 5,
    date: '11 May 2026',
    text: 'A trustworthy neighbor. The chat history made the whole exchange simple.',
  },
  {
    id: 'r7',
    fromId: 'noah',
    rating: 5,
    date: '8 May 2026',
    text: 'Payment hold and return confirmation were easy to understand.',
  },
  {
    id: 'r8',
    fromId: 'eva',
    rating: 4,
    date: '5 May 2026',
    text: 'Good communication and flexible timing when I needed to shift pickup.',
  },
  {
    id: 'r9',
    fromId: 'mike',
    rating: 5,
    date: '1 May 2026',
    text: 'Amanda offered a fair trade and followed up after the exchange.',
  },
  {
    id: 'r10',
    fromId: 'sara',
    rating: 5,
    date: '28 Apr 2026',
    text: 'The item details were accurate, with helpful pickup notes.',
  },
  {
    id: 'r11',
    fromId: 'anna',
    rating: 5,
    date: '24 Apr 2026',
    text: 'Kind, practical, and very responsive in chat.',
  },
  {
    id: 'r12',
    fromId: 'tom',
    rating: 4,
    date: '20 Apr 2026',
    text: 'Smooth exchange overall. The dated logs made it easy to track.',
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
    if (!raw) return fallback
    const saved = JSON.parse(raw) as Partial<AppState>
    return {
      listings: mergeById(saved.listings, seedListings),
      favorites: saved.favorites ?? fallback.favorites,
      chats: mergeById(saved.chats, seedChats),
    }
  } catch {
    return fallback
  }
}

function mergeById<T extends { id: string }>(saved: T[] | undefined, seeded: T[]) {
  const savedItems = saved ?? []
  const savedIds = new Set(savedItems.map((item) => item.id))
  return [...savedItems, ...seeded.filter((item) => !savedIds.has(item.id))]
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
  const [chatMode, setChatMode] = useState<'list' | 'thread'>('list')
  const [messageDraft, setMessageDraft] = useState('')
  const [form, setForm] = useState<DraftListing>(emptyDraft)
  const [notice, setNotice] = useState<string | null>(null)
  const [checkoutListing, setCheckoutListing] = useState<Listing | null>(null)
  const [detailListing, setDetailListing] = useState<Listing | null>(null)
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
    setDetailListing(null)
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
    setChatMode('thread')
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
    setDetailListing(null)
    if (listing.status === 'booked') {
      setState((current) => ({
        ...current,
        listings: current.listings.map((item) =>
          item.id === listing.id ? { ...item, status: item.kind === 'request' ? 'open' : 'available' } : item,
        ),
        chats: current.chats.map((chat) =>
          chat.neighborId === listing.ownerId && chat.listingId === listing.id
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    id: `cancel-${Date.now()}`,
                    author: 'system',
                    text: `Request withdrawn for "${listing.title}". The neighbor can see that this exchange is no longer active.`,
                    time: nowTime(),
                  },
                ],
              }
            : chat,
        ),
      }))
      setNotice('Request withdrawn')
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
              onDetails={setDetailListing}
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
              onDetails={setDetailListing}
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
              mode={chatMode}
              setMode={setChatMode}
              openThread={openThread}
              startDirectChat={startDirectChat}
              sendMessage={sendMessage}
            />
          )}

          {tab === 'profile' && <ProfileScreen listings={state.listings} favorites={state.favorites} />}
        </div>

        <BottomNav
          active={tab}
          onChange={(nextTab) => {
            if (nextTab === 'chats') setChatMode('list')
            setTab(nextTab)
          }}
          unread={state.chats.reduce((total, chat) => total + chat.unread, 0)}
        />
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
      {detailListing && (
        <ListingDetailSheet
          listing={detailListing}
          favorite={state.favorites.includes(detailListing.id)}
          onClose={() => setDetailListing(null)}
          onFavorite={() => toggleFavorite(detailListing.id)}
          onChat={() => openChat(detailListing)}
          onRequest={() => requestListing(detailListing)}
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
    <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label="Payment demo checkout" onClick={onClose}>
      <section className="checkout-sheet" onClick={(event) => event.stopPropagation()}>
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

function ListingDetailSheet({
  listing,
  favorite,
  onClose,
  onFavorite,
  onChat,
  onRequest,
}: {
  listing: Listing
  favorite: boolean
  onClose: () => void
  onFavorite: () => void
  onChat: () => void
  onRequest: () => void
}) {
  const owner = getNeighbor(listing.ownerId)
  const paid = isPaidListing(listing)

  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label={`${listing.title} details`} onClick={onClose}>
      <section className="checkout-sheet detail-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <span>{listing.kind === 'request' ? 'Neighbor request' : paid ? 'Protected exchange' : 'Community share'}</span>
            <h2>{listing.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close listing details">
            <X size={22} />
          </button>
        </div>

        <div className="detail-hero">
          <ListingArt listing={listing} />
          <div>
            <strong>{owner.name}</strong>
            <span>{owner.verified ? 'Verified neighbor' : 'Community profile'} - {owner.rating.toFixed(1)} rating</span>
            <p>{listing.description}</p>
          </div>
        </div>

        <div className="detail-metrics" aria-label="Exchange summary">
          <span><b>{listing.schedule}</b>Available window</span>
          <span><b>{listing.distance}</b>Distance</span>
          <span><b>{listing.price}</b>{paid ? 'Demo hold' : 'Cost'}</span>
        </div>

        <div className="detail-checklist">
          <strong>Demo-ready exchange flow</strong>
          <p>Confirm timing in chat, meet at the shared location, and close the request after pickup or help is complete.</p>
          <div>
            <span><ShieldCheck size={18} /> Identity checked</span>
            <span><MessageCircle size={18} /> Local chat trail</span>
            <span><MapPin size={18} /> {listing.location}</span>
          </div>
        </div>

        <div className="detail-actions">
          <button onClick={onFavorite}>{favorite ? 'Saved' : 'Save'}</button>
          <button onClick={onChat}>Chat</button>
          <button className={`primary-action ${listing.status === 'booked' ? 'danger-action' : ''}`} onClick={onRequest}>
            {listing.status === 'booked' ? 'Withdraw request' : listing.kind === 'request' ? 'Offer help' : paid ? 'Continue to pay' : 'Request'}
          </button>
        </div>
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
  onDetails,
  onBrowseSearch,
}: ListingScreenProps) {
  const requests = listings.filter((listing) => listing.kind === 'request')
  const offers = listings.filter((listing) => listing.kind !== 'request')
  const availableCount = offers.filter((listing) => listing.status === 'available').length
  const favorCount = listings.filter((listing) => !isPaidListing(listing)).length
  const neighborCount = new Set(listings.map((listing) => listing.ownerId)).size

  return (
    <div className="screen-stack">
      <SearchBox value={query} onChange={setQuery} placeholder="What do you need help with?" />
      <NeighborhoodPulse availableCount={availableCount} favorCount={favorCount} neighborCount={neighborCount} />
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
            onDetails={() => onDetails(listing)}
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
  onDetails: (listing: Listing) => void
  onBrowseSearch?: () => void
}

function NeighborhoodPulse({
  availableCount,
  favorCount,
  neighborCount,
}: {
  availableCount: number
  favorCount: number
  neighborCount: number
}) {
  return (
    <section className="pulse-panel" aria-label="Neighborhood activity">
      <div>
        <span>Your nearby sharing circle</span>
        <strong>{availableCount} items and skills ready today</strong>
      </div>
      <dl>
        <div>
          <dt>{neighborCount}</dt>
          <dd>Active neighbors</dd>
        </div>
        <div>
          <dt>{favorCount}</dt>
          <dd>Free favors</dd>
        </div>
        <div>
          <dt>12m</dt>
          <dd>Avg reply</dd>
        </div>
        <div>
          <dt>98%</dt>
          <dd>Safe handoffs</dd>
        </div>
      </dl>
    </section>
  )
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
            onDetails={() => props.onDetails(listing)}
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
  mode,
  setMode,
  openThread,
  startDirectChat,
  sendMessage,
}: {
  chats: ChatThread[]
  activeChat?: ChatThread
  activeListing?: Listing
  draft: string
  setDraft: (value: string) => void
  mode: 'list' | 'thread'
  setMode: (mode: 'list' | 'thread') => void
  openThread: (id: string) => void
  startDirectChat: (neighborId: string) => string
  sendMessage: () => void
}) {
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
          <button className={`thread-listing ${listingDetailsOpen ? 'open' : ''}`} onClick={() => setListingDetailsOpen((value) => !value)}>
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
  type ProfilePanelId = 'reviews' | 'deals' | 'saved' | 'active' | 'lent' | 'borrowed' | 'posts' | 'safe' | 'frugal'
  type ProfileRow = { id: string; title: string; person: string; detail: string; date: string; status: string; logs: string[] }
  const [panel, setPanel] = useState<ProfilePanelId | null>('active')
  const borrowedFromMe: ProfileRow[] = [
    { id: 'lent-drill', title: 'DeWalt hand drill', person: 'John B.', date: '24 May 2026', status: 'Returned', detail: 'Returned yesterday - 5.0 review', logs: ['Request accepted at 09:12', 'Pickup confirmed at Elm street 19', 'Returned clean with all drill bits', 'Review received: 5.0'] },
    { id: 'lent-ladder', title: 'Folding garden ladder', person: 'Linda T.', date: '23 May 2026', status: 'Booked', detail: 'Booked for Thursday - pickup 18:30', logs: ['Linda requested a weekend borrow', 'Pickup window set for 18:30', 'Reminder scheduled for Thursday'] },
    { id: 'lent-bits', title: 'Tool bit set', person: 'Anna', date: '22 May 2026', status: 'Pending', detail: 'Pending confirmation - free lend', logs: ['Anna asked for brick and wood bits', 'Awaiting final pickup time', 'No payment needed'] },
    { id: 'lent-mixer', title: 'Stand mixer for baking', person: 'Priya S.', date: '19 May 2026', status: 'Booked', detail: 'Booked Saturday - free lend', logs: ['Priya saved the post', 'Pickup confirmed for Saturday morning', 'Return expected Sunday evening'] },
    { id: 'lent-cargo', title: 'Cargo bike for errands', person: 'Noah P.', date: '17 May 2026', status: 'Completed', detail: 'Completed Tuesday - paid hold released', logs: ['Payment hold authorized', 'Bike returned charged', 'Hold released after handoff confirmation'] },
    { id: 'lent-washer', title: 'Pressure washer', person: 'Tom R.', date: '15 May 2026', status: 'Reserved', detail: 'Reserved tomorrow - 4 EUR/h', logs: ['Tom requested a one-hour slot', 'Safety note sent in chat', 'Deposit pending pickup'] },
    { id: 'lent-chair', title: 'Wooden kids chair', person: 'Sara K.', date: '12 May 2026', status: 'Returned', detail: 'Returned after birthday party - free', logs: ['Borrowed for weekend guests', 'Returned with thank-you note', 'Marked complete'] },
    { id: 'lent-cot', title: 'Baby travel cot', person: 'Eva M.', date: '9 May 2026', status: 'Completed', detail: 'Weekend lend - 4.8 review', logs: ['Sheet included at pickup', 'Returned Monday morning', 'Review received: 4.8'] },
  ]
  const iBorrowed: ProfileRow[] = [
    { id: 'borrow-grill', title: 'Electric grill', person: 'Mike', date: '25 May 2026', status: 'Active today', detail: 'Today 19:00 - 21:30 - trade plant care', logs: ['Mike approved the request', 'Pickup planned for 19:00', 'Return window agreed for 21:30'] },
    { id: 'borrow-chairs', title: 'Kids party chair set', person: 'Linda T.', date: '24 May 2026', status: 'Booked', detail: 'This weekend - free', logs: ['Saved from Kids category', 'Pickup instructions received', 'Return after Sunday lunch'] },
    { id: 'borrow-cot', title: 'Baby travel cot', person: 'Priya S.', date: '20 May 2026', status: 'Completed', detail: 'Weekend pickup - free', logs: ['Picked up Friday', 'Used for family visit', 'Returned Sunday evening'] },
    { id: 'borrow-cleaner', title: 'Carpet spot cleaner', person: 'Eva M.', date: '18 May 2026', status: 'Reserved', detail: 'Tomorrow - 6 EUR/day', logs: ['Demo payment hold ready', 'Eva will include cleaning solution', 'Pickup location confirmed'] },
    { id: 'borrow-trimmer', title: 'Cordless hedge trimmer', person: 'John B.', date: '16 May 2026', status: 'Completed', detail: 'Saturday - 5 EUR/h', logs: ['Safety gloves included', 'Returned with battery charged', 'Payment hold released'] },
    { id: 'borrow-table', title: 'Folding table for guests', person: 'Sara K.', date: '12 May 2026', status: 'Returned', detail: 'Friday to Sunday - free', logs: ['Borrowed for dinner guests', 'Returned folded and wiped down', 'Sara left a 5.0 review'] },
    { id: 'borrow-bike', title: 'Cargo bike for errands', person: 'Noah P.', date: '7 May 2026', status: 'Completed', detail: 'One-hour grocery trip - 7 EUR/h', logs: ['Payment hold authorized', 'Route shared in chat', 'Returned before deadline'] },
    { id: 'borrow-ladder', title: 'Garden ladder', person: 'John B.', date: '2 May 2026', status: 'Returned', detail: 'Balcony lights - free', logs: ['Picked up after work', 'Used for balcony lights', 'Returned same evening'] },
  ]
  const savedRows: ProfileRow[] = listings
    .filter((listing) => favorites.includes(listing.id))
    .map((listing) => ({
      id: `saved-${listing.id}`,
      title: listing.title,
      person: getNeighbor(listing.ownerId).name,
      date: 'Saved in demo',
      status: listing.status,
      detail: `${listing.price} - ${listing.schedule}`,
      logs: [`Saved from ${listing.category}`, `${listing.location} - ${listing.distance}`, listing.description],
    }))
  const dealRows = borrowedFromMe.concat(iBorrowed)
  const activeRequests: ProfileRow[] = listings
    .filter((listing) => listing.status === 'booked')
    .map((listing) => ({
      id: `active-${listing.id}`,
      title: listing.title,
      person: getNeighbor(listing.ownerId).name,
      date: listing.schedule,
      status: listing.kind === 'request' ? 'Applied' : 'Requested',
      detail: `${listing.price} - ${listing.location}`,
      logs: [
        listing.kind === 'request' ? 'You offered help on this request' : 'You requested this item or skill',
        `Current status: ${listing.kind === 'request' ? 'application sent' : 'request sent'}`,
        'Open the listing card to withdraw or continue the conversation.',
      ],
    }))
  const panelText: Record<ProfilePanelId, { title: string; rows: ProfileRow[] }> = {
    reviews: { title: 'Reviews', rows: reviews.map((review) => ({ id: review.id, title: `${stars(review.rating)} ${getNeighbor(review.fromId).name}`, person: 'Recent feedback', date: review.date, status: `${review.rating}.0 rating`, detail: review.text, logs: ['Exchange completed', 'Review submitted by neighbor', review.text] })) },
    deals: { title: 'All exchange logs', rows: dealRows },
    saved: { title: 'Saved posts', rows: savedRows },
    active: { title: 'Active requests and commitments', rows: activeRequests },
    lent: { title: 'Borrowed from me', rows: borrowedFromMe },
    borrowed: { title: 'I borrowed', rows: iBorrowed },
    posts: { title: 'My active posts', rows: myListings.map((listing) => ({ id: `post-${listing.id}`, title: listing.title, person: listing.category, date: listing.schedule, status: listing.status, detail: `${listing.price} - ${listing.location}`, logs: ['Published by Amanda White', `${listing.distance} from nearby neighbors`, listing.description] })) },
    safe: { title: 'Safe exchange badge', rows: [{ id: 'safe-identity', title: 'Verified identity', person: 'Safety', date: 'Updated 25 May 2026', status: 'Verified', detail: 'Profile, location, and neighbor feedback have been checked for safer meetups.', logs: ['Phone and profile confirmed', 'Meetup checklist enabled', 'Visible safety badge added to profile'] }] },
    frugal: { title: 'Frugal lifestyle badge', rows: [{ id: 'frugal-resource', title: 'Resource saver', person: 'Community', date: 'May 2026', status: 'Active', detail: `${dealRows.length} successful reuse deals helped avoid buying duplicate household items.`, logs: ['Shared household items instead of buying duplicates', 'Completed free favors and paid holds', 'Badge updates as exchange history grows'] }] },
  }
  const reviewCount = panelText.reviews.rows.length
  const dealCount = dealRows.length
  const togglePanel = (nextPanel: ProfilePanelId) => setPanel((current) => (current === nextPanel ? null : nextPanel))

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
          <button className="verified" onClick={() => togglePanel('safe')}>Verified</button>
        </div>
      </div>
      <div className="stats-strip">
        <button className={panel === 'reviews' ? 'active' : ''} onClick={() => togglePanel('reviews')}>{reviewCount} Reviews</button>
        <button className={panel === 'deals' ? 'active' : ''} onClick={() => togglePanel('deals')}>{dealCount} Deals</button>
        <button className={panel === 'saved' ? 'active' : ''} onClick={() => togglePanel('saved')}>{favorites.length} Saved</button>
      </div>
      {panel && ['reviews', 'deals', 'saved', 'safe', 'frugal'].includes(panel) && <ProfileDetail data={panelText[panel]} />}
      <p className="bio">I want to help and share things that others do not have. I value living green and living sparingly.</p>
      <SectionTitle title="Requests and history" active={panel === 'active' || panel === 'lent' || panel === 'borrowed' || panel === 'posts'} onClick={() => togglePanel('active')} />
      <div className="history-list">
        <button className={panel === 'active' ? 'active' : ''} onClick={() => togglePanel('active')}>Active requests ({activeRequests.length})<ChevronRight size={20} /></button>
        <button className={panel === 'lent' ? 'active' : ''} onClick={() => togglePanel('lent')}>Borrowed from me ({borrowedFromMe.length})<ChevronRight size={20} /></button>
        <button className={panel === 'borrowed' ? 'active' : ''} onClick={() => togglePanel('borrowed')}>I borrowed ({iBorrowed.length})<ChevronRight size={20} /></button>
        <button className={panel === 'posts' ? 'active' : ''} onClick={() => togglePanel('posts')}>My active posts ({myListings.length})<ChevronRight size={20} /></button>
      </div>
      {panel && ['active', 'lent', 'borrowed', 'posts'].includes(panel) && <ProfileDetail data={panelText[panel]} />}
      <SectionTitle title="Evaluations" active={panel === 'safe' || panel === 'frugal'} onClick={() => togglePanel('safe')} />
      <div className="badges">
        <button className={panel === 'safe' ? 'active' : ''} onClick={() => togglePanel('safe')}>Shield Safe exchange</button>
        <button className={panel === 'frugal' ? 'active' : ''} onClick={() => togglePanel('frugal')}>Frugal lifestyle</button>
      </div>
      <button className="review-card" onClick={() => togglePanel('reviews')}>
        <img src={getNeighbor(reviews[0].fromId).avatar} alt="" />
        <div>
          <strong>{getNeighbor(reviews[0].fromId).name} <span>{stars(reviews[0].rating)}</span></strong>
          <p>{reviews[0].text}</p>
        </div>
      </button>
    </div>
  )
}

function ProfileDetail({
  data,
}: {
  data: { title: string; rows: Array<{ id: string; title: string; person: string; detail: string; date: string; status: string; logs: string[] }> }
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const previewLimit = 4
  const visibleRows = showAll ? data.rows : data.rows.slice(0, previewLimit)

  return (
    <div className="profile-detail">
      <div className="profile-detail-head">
        <strong>{data.title}</strong>
        <span>{data.rows.length} total</span>
      </div>
      {data.rows.length === 0 ? (
        <p>No items yet. Save a post or publish one to fill this section.</p>
      ) : (
        <>
          {visibleRows.map((row) => {
            const expanded = expandedId === row.id
            return (
              <button
                key={row.id}
                className={`profile-log ${expanded ? 'expanded' : ''}`}
                onClick={() => setExpandedId(expanded ? null : row.id)}
              >
                <span>{row.person} - {row.date}</span>
                <b>{row.title}</b>
                <p>{row.detail}</p>
                <small>{row.status}</small>
                {expanded && (
                  <ol>
                    {row.logs.map((log) => (
                      <li key={log}>{log}</li>
                    ))}
                  </ol>
                )}
              </button>
            )
          })}
          {data.rows.length > previewLimit && (
            <button className="show-more" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'Show less' : `Show all ${data.rows.length}`}
            </button>
          )}
        </>
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

function SectionTitle({ title, onClick, active }: { title: string; onClick?: () => void; active?: boolean }) {
  return (
    <button className={`section-title ${active ? 'active' : ''}`} type="button" onClick={onClick}>
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
  onDetails,
  compact,
}: {
  listing: Listing
  favorite: boolean
  onFavorite: () => void
  onRequest: () => void
  onChat: () => void
  onDetails: () => void
  compact?: boolean
}) {
  const owner = getNeighbor(listing.ownerId)
  return (
    <article
      className={`listing-card ${compact ? 'compact' : ''} ${listing.status === 'booked' ? 'booked' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${listing.title}`}
      onClick={onDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onDetails()
        }
      }}
    >
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
        <button
          className={`star-button ${favorite ? 'saved' : ''}`}
          onClick={(event) => {
            event.stopPropagation()
            onFavorite()
          }}
          aria-label="Toggle favorite"
        >
          <Star size={21} fill="currentColor" />
        </button>
      </div>
      <div className="card-actions">
        <span className={`kind-pill ${listing.kind}`}>{listing.kind}</span>
        <span className="price">{listing.price}</span>
        {listing.status === 'booked' && <span className="status-pill">{listing.kind === 'request' ? 'Applied' : 'Requested'}</span>}
        <button
          onClick={(event) => {
            event.stopPropagation()
            onDetails()
          }}
        >
          Details
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation()
            onChat()
          }}
        >
          Chat
        </button>
        <button
          className={`primary-mini ${listing.status === 'booked' ? 'danger-action' : ''}`}
          onClick={(event) => {
            event.stopPropagation()
            onRequest()
          }}
        >
          {listing.status === 'booked' ? 'Withdraw' : listing.kind === 'request' ? 'Offer help' : 'Request'}
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
