'use strict';

// Portfolio entries returned by GET /api/projects.
// IMPORTANT: every entry below is a DEMONSTRATION project built to show our approach.
// None of them is a real client. Replace them with real case studies when you have them
// and set `demo: false` on those entries.
const categories = [
  { id: 'websites', label: 'Websites' },
  { id: 'web-apps', label: 'Web Apps' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'education', label: 'Education' },
  { id: 'ai', label: 'AI & Automation' },
];

const projects = [
  {
    id: 'northwind-cafe',
    title: 'Northwind Café',
    category: 'websites',
    description: 'A fast one-page site for a neighbourhood café: menu, opening hours, map and a table-enquiry form.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Node.js'],
    image: '/img/project-northwind-cafe.svg',
    imageAlt: 'Illustration of a café website with a large hero image and menu cards',
    demo: true,
  },
  {
    id: 'harbor-legal',
    title: 'Harbor Legal Group',
    category: 'websites',
    description: 'A clean, trustworthy site for a small professional-services firm with practice-area pages and enquiry form.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'SEO'],
    image: '/img/project-harbor-legal.svg',
    imageAlt: 'Illustration of a professional services website with a navy header and text columns',
    demo: true,
  },
  {
    id: 'taskbridge',
    title: 'TaskBridge',
    category: 'web-apps',
    description: 'A team task board with projects, assignees, due dates and a simple activity feed.',
    technologies: ['JavaScript', 'Node.js', 'Express', 'PostgreSQL'],
    image: '/img/project-taskbridge.svg',
    imageAlt: 'Illustration of a kanban-style task board with three columns',
    demo: true,
  },
  {
    id: 'stockroom',
    title: 'Stockroom Inventory',
    category: 'web-apps',
    description: 'An inventory dashboard that tracks stock levels, low-stock alerts and supplier orders.',
    technologies: ['JavaScript', 'Node.js', 'Express', 'REST API'],
    image: '/img/project-stockroom.svg',
    imageAlt: 'Illustration of an analytics dashboard with charts and a data table',
    demo: true,
  },
  {
    id: 'cedar-and-co',
    title: 'Cedar & Co. Store',
    category: 'ecommerce',
    description: 'A home-goods online shop with product filters, a cart, checkout and an order admin screen.',
    technologies: ['JavaScript', 'Node.js', 'Payment API', 'MongoDB'],
    image: '/img/project-cedar-store.svg',
    imageAlt: 'Illustration of an online store with a grid of product cards',
    demo: true,
  },
  {
    id: 'bloom-boutique',
    title: 'Bloom Boutique',
    category: 'ecommerce',
    description: 'A fashion boutique storefront with size and colour variants, wishlists and discount codes.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Express'],
    image: '/img/project-bloom-boutique.svg',
    imageAlt: 'Illustration of a boutique store page with a featured product and product grid',
    demo: true,
  },
  {
    id: 'brightfield-portal',
    title: 'Brightfield School Portal',
    category: 'education',
    description: 'A school portal for attendance, timetables, announcements and parent communication.',
    technologies: ['JavaScript', 'Node.js', 'Express', 'PostgreSQL'],
    image: '/img/project-brightfield-portal.svg',
    imageAlt: 'Illustration of a school portal with a sidebar, timetable grid and announcements',
    demo: true,
  },
  {
    id: 'results-viewer',
    title: 'Exam Results Viewer',
    category: 'education',
    description: 'A secure results lookup where students see marks and teachers enter and publish grades.',
    technologies: ['JavaScript', 'Node.js', 'Express', 'SQLite'],
    image: '/img/project-results-viewer.svg',
    imageAlt: 'Illustration of a results table with grade badges',
    demo: true,
  },
  {
    id: 'helpdesk-assistant',
    title: 'HelpDesk Assistant',
    category: 'ai',
    description: 'A website chatbot that answers common questions from a business’s own FAQ and escalates to a person.',
    technologies: ['JavaScript', 'Node.js', 'LLM API', 'REST API'],
    image: '/img/project-helpdesk-assistant.svg',
    imageAlt: 'Illustration of a chat window with alternating message bubbles',
    demo: true,
  },
];

module.exports = { categories, projects };
