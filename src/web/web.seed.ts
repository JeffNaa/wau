export const BUILT_IN_WIDGETS = [
  {
    type: 'wau:hero',
    name: 'Hero',
    category: 'layout',
    configSchema: {
      title: { type: 'string', label: 'Title' },
      subtitle: { type: 'string', label: 'Subtitle' },
      buttonText: { type: 'string', label: 'Button Text' },
      buttonLink: { type: 'string', label: 'Button Link' },
      backgroundImage: { type: 'image', label: 'Background Image' },
    },
  },
  {
    type: 'wau:text',
    name: 'Text',
    category: 'content',
    configSchema: {
      content: { type: 'text', label: 'Content' },
      align: { type: 'select', label: 'Alignment', options: ['left', 'center', 'right'] },
    },
  },
  {
    type: 'wau:image',
    name: 'Image',
    category: 'media',
    configSchema: {
      src: { type: 'image', label: 'Image URL' },
      alt: { type: 'string', label: 'Alt Text' },
      width: { type: 'number', label: 'Width (px)' },
      height: { type: 'number', label: 'Height (px)' },
    },
  },
  {
    type: 'wau:button',
    name: 'Button',
    category: 'content',
    configSchema: {
      text: { type: 'string', label: 'Button Text' },
      link: { type: 'link', label: 'Link URL' },
      variant: { type: 'select', label: 'Variant', options: ['primary', 'secondary', 'outline'] },
    },
  },
  {
    type: 'wau:divider',
    name: 'Divider',
    category: 'layout',
    configSchema: {
      style: { type: 'select', label: 'Style', options: ['solid', 'dashed', 'dotted'] },
      color: { type: 'color', label: 'Color' },
    },
  },
  {
    type: 'wau:spacer',
    name: 'Spacer',
    category: 'layout',
    configSchema: {
      height: { type: 'number', label: 'Height (px)' },
    },
  },
  {
    type: 'wau:gallery',
    name: 'Gallery',
    category: 'media',
    configSchema: {
      images: { type: 'array', label: 'Images', itemType: 'image' },
      columns: { type: 'select', label: 'Columns', options: ['2', '3', '4', '5'] },
      gap: { type: 'number', label: 'Gap (px)' },
    },
  },
  {
    type: 'wau:features',
    name: 'Features',
    category: 'layout',
    configSchema: {
      items: {
        type: 'array',
        label: 'Feature Items',
        itemSchema: {
          icon: { type: 'string', label: 'Icon' },
          title: { type: 'string', label: 'Title' },
          description: { type: 'text', label: 'Description' },
        },
      },
    },
  },
  {
    type: 'wau:video',
    name: 'Video',
    category: 'media',
    configSchema: {
      url: { type: 'string', label: 'Video URL' },
      autoplay: { type: 'boolean', label: 'Autoplay' },
    },
  },
  {
    type: 'wau:html',
    name: 'HTML',
    category: 'content',
    configSchema: {
      html: { type: 'text', label: 'HTML Content' },
    },
  },
];
