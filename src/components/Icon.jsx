import {
  ArrowUpRight, ArrowRight, BatteryCharging, Check, ChevronDown, Clock3,
  Cpu, Fan, HardDrive, Laptop, Layers3, MapPin, MemoryStick, Menu, MessageCircle,
  Monitor, Phone, Play, Power, ShieldCheck, Snowflake, Wrench, X, Zap,
  CircleHelp, Gauge, PanelTop, Search, CheckCircle2, Mail
} from 'lucide-react';
const icons = { ArrowUpRight, ArrowRight, BatteryCharging, Check, ChevronDown, Clock3,
  Cpu, Fan, HardDrive, Laptop, Layers3, MapPin, MemoryStick, Menu, MessageCircle,
  Monitor, Phone, Play, Power, ShieldCheck, Snowflake, Wrench, X, Zap,
  CircleHelp, Gauge, PanelTop, Search, CheckCircle2, Mail };
export default function Icon({ name, size = 20, ...props }) {
  const Component = icons[name] || Wrench;
  return <Component size={size} strokeWidth={1.75} aria-hidden="true" focusable="false" {...props} />;
}
