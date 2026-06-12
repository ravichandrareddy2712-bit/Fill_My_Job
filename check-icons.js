const icons = require('lucide-react');
const toCheck = [
  'LayoutDashboard', 'XCircle', 'CheckCircle2', 'CloudUpload',
  'TrendingUp', 'Briefcase', 'MoreHorizontal', 'Filter',
  'ExternalLink', 'LogOut', 'ChevronDown', 'Search',
  'BrainCircuit', 'Target', 'FileText', 'Bell', 'Settings',
  'Clock', 'Plus', 'Menu', 'ArrowRight', 'ArrowLeft',
  'Check', 'Upload', 'User', 'MapPin', 'Network', 'Code2', 'Share2'
];
toCheck.forEach(name => {
  console.log(name + ': ' + (icons[name] ? 'OK' : 'MISSING'));
});
