import React from 'react';
import * as LucideIcons from 'lucide-react';

const iconMap = {
  // Navigation & Actions
  home:     LucideIcons.Home,
  map:      LucideIcons.Map,
  pin:      LucideIcons.MapPin,
  car:      LucideIcons.Car,
  bell:     LucideIcons.Bell,
  user:     LucideIcons.User,
  users:    LucideIcons.Users,
  settings: LucideIcons.Settings,
  logout:   LucideIcons.LogOut,
  login:    LucideIcons.LogIn,
  back:     LucideIcons.ArrowLeft,
  close:    LucideIcons.X,
  check:    LucideIcons.Check,
  menu:     LucideIcons.Menu,
  search:   LucideIcons.Search,
  plus:     LucideIcons.Plus,
  minus:    LucideIcons.Minus,
  trash:    LucideIcons.Trash2,
  edit:     LucideIcons.Pencil,
  save:     LucideIcons.Save,
  download: LucideIcons.Download,
  upload:   LucideIcons.Upload,
  copy:     LucideIcons.Copy,
  share:    LucideIcons.Share2,
  refresh:  LucideIcons.RefreshCw,
  external: LucideIcons.ExternalLink,

  // Status & Notifications
  success:  LucideIcons.CheckCircle2,
  error:    LucideIcons.XCircle,
  warning:  LucideIcons.AlertTriangle,
  info:     LucideIcons.Info,
  checkCircle: LucideIcons.CheckCircle,
  verified: LucideIcons.BadgeCheck,
  ban:      LucideIcons.Ban,
  alert:    LucideIcons.BellRing,
  question: LucideIcons.HelpCircle,

  // Data & Analytics
  chart:    LucideIcons.BarChart3,
  chartLine:LucideIcons.TrendingUp,
  chartPie: LucideIcons.PieChart,
  analytics:LucideIcons.BarChart3,
  stats:    LucideIcons.Activity,
  list:     LucideIcons.List,
  table:    LucideIcons.Table,
  clipboard:LucideIcons.ClipboardList,
  file:     LucideIcons.FileText,
  history:  LucideIcons.Clock,
  calendar: LucideIcons.Calendar,

  // Gas Station
  fuel:     LucideIcons.Fuel,
  gasPump:  LucideIcons.Fuel,
  station:  LucideIcons.Fuel,
  drop:     LucideIcons.Droplets,

  // Auth & Admin
  admin:    LucideIcons.Shield,
  lock:     LucideIcons.Lock,
  unlock:   LucideIcons.Unlock,
  key:      LucideIcons.Key,
  eye:      LucideIcons.Eye,
  eyeOff:   LucideIcons.EyeOff,

  // Communication
  phone:    LucideIcons.Phone,
  mail:     LucideIcons.Mail,
  message:  LucideIcons.MessageSquare,
  send:     LucideIcons.Send,
  notifications: LucideIcons.Bell,

  // UI Essentials
  sun:      LucideIcons.Sun,
  moon:     LucideIcons.Moon,
  star:     LucideIcons.Star,
  heart:    LucideIcons.Heart,
  globe:    LucideIcons.Globe,
  flag:     LucideIcons.Flag,
  tag:      LucideIcons.Tag,

  // Arrows
  arrowRight:  LucideIcons.ArrowRight,
  arrowLeft:   LucideIcons.ArrowLeft,
  arrowUp:     LucideIcons.ArrowUp,
  arrowDown:   LucideIcons.ArrowDown,
  chevronRight:LucideIcons.ChevronRight,
  chevronLeft: LucideIcons.ChevronLeft,
  chevronUp:   LucideIcons.ChevronUp,
  chevronDown: LucideIcons.ChevronDown,

  // Time
  clock:    LucideIcons.Clock,
  timer:    LucideIcons.Timer,
  watch:    LucideIcons.Watch,
  alarmClock:LucideIcons.AlarmClock,
  stopwatch:LucideIcons.StopCircle,

  // Energy & Transport
  battery:  LucideIcons.Battery,
  zap:      LucideIcons.Zap,
  rocket:   LucideIcons.Rocket,

  // Misc
  gift:     LucideIcons.Gift,
  party:    LucideIcons.PartyPopper,
  ticket:   LucideIcons.Ticket,
  mapIcon:  LucideIcons.Map,
  location: LucideIcons.MapPin,
  building: LucideIcons.Building2,
  boxes:    LucideIcons.Boxes,
  package:  LucideIcons.Package,
  creditCard: LucideIcons.CreditCard,
  dollar:   LucideIcons.DollarSign,
  receipt:  LucideIcons.Receipt,
  qrCode:   LucideIcons.QrCode,
  scan:     LucideIcons.Scan,
  camera:   LucideIcons.Camera,
  image:    LucideIcons.Image,
  video:    LucideIcons.Video,
  music:    LucideIcons.Music,
  phoneCall:LucideIcons.PhoneCall,
  smartphone:LucideIcons.Smartphone,
  wifi:     LucideIcons.Wifi,
  bluetooth:LucideIcons.Bluetooth,

  // Queue
  queue:    LucideIcons.ListOrdered,
  position: LucideIcons.ChefHat,
  assign:   LucideIcons.UserPlus,
  done:     LucideIcons.CheckCircle2,
  cancel:   LucideIcons.XCircle,
  clear:    LucideIcons.Eraser,
  filter:   LucideIcons.Filter,
  sort:     LucideIcons.ArrowUpDown,

  // Transport
  truck:    LucideIcons.Truck,
  bike:     LucideIcons.Bike,
  navigation: LucideIcons.Compass,
  route:    LucideIcons.Route,
  signpost: LucideIcons.Signpost,

  // Weather
  cloudy:   LucideIcons.Cloud,
  sunIcon:  LucideIcons.Sun,
  moonIcon: LucideIcons.Moon,
  snowflake:LucideIcons.Snowflake,
  umbrella: LucideIcons.Umbrella,

  // Rating
  starFilled: LucideIcons.Star,
  starHalf:   LucideIcons.StarHalf,
  thumbsUp:   LucideIcons.ThumbsUp,
  thumbsDown: LucideIcons.ThumbsDown,
  smile:      LucideIcons.Smile,
  frown:      LucideIcons.Frown,
  meh:        LucideIcons.Meh,

  // Common actions
  play:     LucideIcons.Play,
  pause:    LucideIcons.Pause,
  forward:  LucideIcons.FastForward,
  rewind:   LucideIcons.Rewind,
  repeat:   LucideIcons.Repeat,
  shuffle:  LucideIcons.Shuffle,
  maximize: LucideIcons.Maximize2,
  minimize: LucideIcons.Minimize2,
  fullscreen:LucideIcons.Fullscreen,
  expand:   LucideIcons.Maximize,
  collapse: LucideIcons.Minimize,

  // Shapes
  circle:   LucideIcons.Circle,
  square:   LucideIcons.Square,
  triangle: LucideIcons.Triangle,
  hexagon:  LucideIcons.Hexagon,
  octagon:  LucideIcons.Octagon,
  diamond:  LucideIcons.Diamond,
  shield:   LucideIcons.Shield,
  badge:    LucideIcons.BadgeCheck,

  // Hand gestures
  hand:     LucideIcons.Hand,
  pointer:  LucideIcons.Pointer,
  grab:     LucideIcons.Move,
  drag:     LucideIcons.GripVertical,
  grip:     LucideIcons.GripHorizontal,
  move:     LucideIcons.Move,
  resize:   LucideIcons.Maximize2,

  // Devices
  monitor:  LucideIcons.Monitor,
  tablet:   LucideIcons.Tablet,
  laptop:   LucideIcons.Laptop,
  mobile:   LucideIcons.Smartphone,
  watchIcon:LucideIcons.Watch,
  tv:       LucideIcons.Tv,
  printer:  LucideIcons.Printer,
  scanner:  LucideIcons.Scan,
  speaker:  LucideIcons.Volume2,
  headphone:LucideIcons.Headphones,

  // Files
  folder:   LucideIcons.Folder,
  folderOpen:LucideIcons.FolderOpen,
  fileText: LucideIcons.FileText,
  fileCode: LucideIcons.FileCode,
  fileJson: LucideIcons.FileJson,
  pdf:      LucideIcons.File,
  csv:      LucideIcons.FileSpreadsheet,
  imageIcon:LucideIcons.Image,
  zip:      LucideIcons.Archive,

  // E-commerce
  cart:     LucideIcons.ShoppingCart,
  bag:      LucideIcons.ShoppingBag,
  giftIcon: LucideIcons.Gift,
  coupon:   LucideIcons.Ticket,
  discount: LucideIcons.Percent,

  // Network
  network:  LucideIcons.Network,
  server:   LucideIcons.Server,
  database: LucideIcons.Database,
  cloud:    LucideIcons.Cloud,
  hardDrive:LucideIcons.HardDrive,

  // Social
  twitter:  LucideIcons.MessageCircle,
  github:   LucideIcons.Code2,
  linkedin: LucideIcons.Link,
  youtube:  LucideIcons.Play,
  instagram:LucideIcons.Camera,
  facebook: LucideIcons.MessageSquare,
  slack:    LucideIcons.MessageCircle,
};

const sizeMap = {
  xs: 12, sm: 14, md: 18, lg: 22, xl: 28, '2xl': 36, '3xl': 48,
};

export default function Icon({ name, size = 'md', className = '', style = {} }) {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return <span style={{ width: sizeMap[size] || 18, height: sizeMap[size] || 18, display: 'inline-block' }} />;
  }
  const px = typeof size === 'number' ? size : (sizeMap[size] || 18);
  return (
    <LucideIcon
      size={px}
      className={className}
      style={{ flexShrink: 0, ...style }}
    />
  );
}

export { iconMap };
