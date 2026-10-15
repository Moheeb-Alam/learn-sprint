'use strict';

// Service catalogue returned by GET /api/services.
// `icon` is the name of an icon in frontend/js/icons.js.
const services = [
  {
    id: 'website-development',
    title: 'Website Development',
    icon: 'globe',
    summary: 'Fast, responsive websites that explain what you do and make it easy for people to get in touch.',
    features: ['Mobile-first, responsive layouts', 'Clean, maintainable code', 'Contact forms and analytics setup'],
  },
  {
    id: 'custom-web-applications',
    title: 'Custom Web Applications',
    icon: 'layout',
    summary: 'Dashboards, portals and internal tools built around the way your team actually works.',
    features: ['User accounts and role-based access', 'Database design and admin screens', 'Documented, extendable codebase'],
  },
  {
    id: 'ecommerce-development',
    title: 'E-commerce Development',
    icon: 'cart',
    summary: 'Online shops that are simple to manage and straightforward for customers to buy from.',
    features: ['Product catalogue and cart', 'Online payment integration', 'Order and stock management'],
  },
  {
    id: 'school-management-systems',
    title: 'School Management Systems',
    icon: 'cap',
    summary: 'Software that keeps student records, attendance, timetables and results in one organised place.',
    features: ['Student, teacher and class records', 'Attendance, timetables and results', 'Parent and staff portals'],
  },
  {
    id: 'ai-chatbots',
    title: 'AI Chatbots',
    icon: 'bot',
    summary: 'Assistants that answer common questions from your own content, around the clock.',
    features: ['Trained on your own FAQs and documents', 'Website and messaging-app embeds', 'Hand-off to a person when needed'],
  },
  {
    id: 'api-integration',
    title: 'API Integration',
    icon: 'plug',
    summary: 'Connect the tools you already use so data moves between them without copy-and-paste.',
    features: ['Payment, email and SMS providers', 'Connect existing tools and databases', 'Clear error handling and logging'],
  },
  {
    id: 'seo',
    title: 'SEO',
    icon: 'search',
    summary: 'Technical and on-page improvements that help search engines understand and rank your site.',
    features: ['Technical SEO and page-speed fixes', 'Page structure and metadata', 'Sitemap and Search Console setup'],
  },
  {
    id: 'website-maintenance',
    title: 'Website Maintenance',
    icon: 'wrench',
    summary: 'Keep your site updated, backed up and secure after launch.',
    features: ['Updates and security patches', 'Backups and uptime checks', 'Content and small feature changes'],
  },
  {
    id: 'technical-support',
    title: 'Technical Support',
    icon: 'support',
    summary: 'Hands-on help when something breaks or when your team needs guidance.',
    features: ['Troubleshooting and bug fixes', 'Hosting and domain assistance', 'Guidance for your team'],
  },
];

module.exports = { services };
