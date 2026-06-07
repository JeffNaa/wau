export const BUILT_IN_WIDGETS = [
  {
    type: 'wau:hero',
    name: 'Hero',
    category: 'layout',
    icon: 'Layout',
    configSchema: {
      title: { type: 'string', label: 'Title' },
      subtitle: { type: 'string', label: 'Subtitle' },
      buttonText: { type: 'string', label: 'Button Text' },
      buttonLink: { type: 'string', label: 'Button Link' },
      backgroundImage: { type: 'image', label: 'Background Image' },
      align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
      minHeight: { type: 'number', label: 'Min Height (px)' },
    },
  },
  {
    type: 'wau:text',
    name: 'Text',
    category: 'content',
    icon: 'Type',
    configSchema: {
      content: { type: 'text', label: 'Content' },
      align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right', 'justify'] },
      size: { type: 'select', label: 'Size', options: ['sm', 'base', 'lg', 'xl'] },
      color: { type: 'color', label: 'Color' },
    },
  },
  {
    type: 'wau:image',
    name: 'Image',
    category: 'media',
    icon: 'Image',
    configSchema: {
      src: { type: 'image', label: 'Image URL' },
      alt: { type: 'string', label: 'Alt Text' },
      width: { type: 'number', label: 'Width (px)' },
      height: { type: 'number', label: 'Height (px)' },
      objectFit: { type: 'select', label: 'Object Fit', options: ['cover', 'contain', 'fill'] },
      borderRadius: { type: 'number', label: 'Border Radius (px)' },
    },
  },
  {
    type: 'wau:button',
    name: 'Button',
    category: 'content',
    icon: 'MousePointerClick',
    configSchema: {
      text: { type: 'string', label: 'Button Text' },
      link: { type: 'link', label: 'Link URL' },
      variant: { type: 'select', label: 'Variant', options: ['primary', 'secondary', 'outline', 'ghost'] },
      size: { type: 'select', label: 'Size', options: ['sm', 'md', 'lg'] },
      fullWidth: { type: 'boolean', label: 'Full Width' },
    },
  },
  {
    type: 'wau:divider',
    name: 'Divider',
    category: 'layout',
    icon: 'Minus',
    configSchema: {
      style: { type: 'select', label: 'Style', options: ['solid', 'dashed', 'dotted'] },
      color: { type: 'color', label: 'Color' },
      thickness: { type: 'number', label: 'Thickness (px)' },
      width: { type: 'select', label: 'Width', options: ['full', 'partial'] },
    },
  },
  {
    type: 'wau:spacer',
    name: 'Spacer',
    category: 'layout',
    icon: 'MoveVertical',
    configSchema: {
      height: { type: 'number', label: 'Height (px)' },
    },
  },
  {
    type: 'wau:gallery',
    name: 'Gallery',
    category: 'media',
    icon: 'Images',
    configSchema: {
      images: { type: 'array', label: 'Images', itemType: 'image' },
      columns: { type: 'select', label: 'Columns', options: ['2', '3', '4'] },
      gap: { type: 'number', label: 'Gap (px)' },
      borderRadius: { type: 'number', label: 'Border Radius (px)' },
    },
  },
  {
    type: 'wau:features',
    name: 'Features',
    category: 'layout',
    icon: 'Grid3x3',
    configSchema: {
      items: {
        type: 'array',
        label: 'Feature Items',
        itemSchema: {
          icon: { type: 'icon', label: 'Icon' },
          title: { type: 'string', label: 'Title' },
          description: { type: 'text', label: 'Description' },
        },
      },
      columns: { type: 'select', label: 'Columns', options: ['1', '2', '3', '4'] },
      align: { type: 'select', label: 'Alignment', options: ['left', 'center'] },
    },
  },
  {
    type: 'wau:video',
    name: 'Video',
    category: 'media',
    icon: 'Play',
    configSchema: {
      url: { type: 'string', label: 'Video URL' },
      autoplay: { type: 'boolean', label: 'Autoplay' },
      controls: { type: 'boolean', label: 'Show Controls' },
      muted: { type: 'boolean', label: 'Muted' },
      loop: { type: 'boolean', label: 'Loop' },
    },
  },
  {
    type: 'wau:html',
    name: 'HTML',
    category: 'content',
    icon: 'Code',
    configSchema: {
      html: { type: 'richtext', label: 'HTML Content' },
    },
  },
];

export const DEFAULT_SITE_THEME = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  accent: '#f59e0b',
  background: '#ffffff',
  foreground: '#0f172a',
  radius: 0.5,
};

export const DEFAULT_SITE_HEADER = {
  logo: 'Wau',
  sticky: true,
  transparent: false,
};

export const DEFAULT_SITE_FOOTER = {
  copyright: 'Wau. All rights reserved.',
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
  ],
  social: [
    { label: 'Twitter', href: '#' },
    { label: 'GitHub', href: '#' },
  ],
};

export const DEFAULT_NAVIGATION = [
  { label: 'Home', href: '/', position: 'header', order: 0 },
  { label: 'About', href: '/about', position: 'header', order: 1 },
  { label: 'Contact', href: '/contact', position: 'header', order: 2 },
  { label: 'Dashboard', href: '/admin/dashboard', position: 'dashboard_sidebar', order: 0 },
  { label: 'Theme', href: '/admin/theme', position: 'dashboard_sidebar', order: 1 },
  { label: 'Navigation', href: '/admin/navigation', position: 'dashboard_sidebar', order: 2 },
];

export const DEFAULT_HOME_PAGE = {
  slug: 'home',
  title: 'Home',
  layout: { sections: [] },
  meta: {},
  isHome: true,
  status: 'PUBLISHED',
};
