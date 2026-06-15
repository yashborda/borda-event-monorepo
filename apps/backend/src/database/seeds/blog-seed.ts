import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';

import { adminUsers } from '../schema/admin-users.table';
import { blogAuthors } from '../schema/blog-authors.table';
import { blogCategories } from '../schema/blog-categories.table';
import { blogCategoryRelations } from '../schema/blog-category-relations.table';
import { blogTagRelations } from '../schema/blog-tag-relations.table';
import { blogTags } from '../schema/blog-tags.table';
import { blogs } from '../schema/blogs.table';

const AUTHORS = [
  {
    fullName: 'Alex Morgan',
    slug: 'alex-morgan',
    email: 'alex.morgan@example.com',
    designation: 'Senior Software Engineer',
    bio: 'Alex writes about backend systems, APIs, and distributed architectures.',
  },
  {
    fullName: 'Priya Sharma',
    slug: 'priya-sharma',
    email: 'priya.sharma@example.com',
    designation: 'Full Stack Developer',
    bio: 'Priya covers full-stack development with a focus on React and Node.js.',
  },
  {
    fullName: 'James Carter',
    slug: 'james-carter',
    email: 'james.carter@example.com',
    designation: 'DevOps Engineer',
    bio: 'James specialises in CI/CD pipelines, Docker, and Kubernetes deployments.',
  },
  {
    fullName: 'Sofia Reyes',
    slug: 'sofia-reyes',
    email: 'sofia.reyes@example.com',
    designation: 'UX Designer',
    bio: 'Sofia explores user-centred design, accessibility, and design systems.',
  },
  {
    fullName: 'David Kim',
    slug: 'david-kim',
    email: 'david.kim@example.com',
    designation: 'Product Manager',
    bio: 'David writes about product strategy, agile delivery, and startup growth.',
  },
  {
    fullName: 'Emily Chen',
    slug: 'emily-chen',
    email: 'emily.chen@example.com',
    designation: 'Machine Learning Engineer',
    bio: 'Emily dives into ML model development, data pipelines, and AI ethics.',
  },
  {
    fullName: 'Marcus Webb',
    slug: 'marcus-webb',
    email: 'marcus.webb@example.com',
    designation: 'Cloud Architect',
    bio: 'Marcus designs scalable cloud infrastructure across AWS, GCP, and Azure.',
  },
  {
    fullName: 'Nina Patel',
    slug: 'nina-patel',
    email: 'nina.patel@example.com',
    designation: 'Security Researcher',
    bio: 'Nina focuses on application security, threat modelling, and secure coding practices.',
  },
  {
    fullName: 'Ryan Thompson',
    slug: 'ryan-thompson',
    email: 'ryan.thompson@example.com',
    designation: 'Frontend Architect',
    bio: 'Ryan builds performant frontends and writes about modern web standards.',
  },
  {
    fullName: 'Aisha Okonkwo',
    slug: 'aisha-okonkwo',
    email: 'aisha.okonkwo@example.com',
    designation: 'Data Engineer',
    bio: 'Aisha works on data platform engineering, ETL pipelines, and analytics infrastructure.',
  },
  {
    fullName: 'Lucas Fernandez',
    slug: 'lucas-fernandez',
    email: 'lucas.fernandez@example.com',
    designation: 'Backend Developer',
    bio: 'Lucas writes about API design, database optimisation, and microservices.',
  },
  {
    fullName: 'Mei Zhang',
    slug: 'mei-zhang',
    email: 'mei.zhang@example.com',
    designation: 'Platform Engineer',
    bio: 'Mei covers platform reliability, observability, and internal developer tooling.',
  },
];

const CATEGORIES = [
  {
    categoryName: 'Technology',
    slug: 'technology',
    sortOrder: 1,
    excerpt:
      'In-depth articles on the latest technology trends and innovations shaping the industry.',
    metaTitle: 'Technology Articles',
    metaDescription:
      'In-depth articles on the latest technology trends and innovations.',
  },
  {
    categoryName: 'Business',
    slug: 'business',
    sortOrder: 2,
    excerpt:
      'Practical business strategies, startup advice, and industry analysis for modern teams.',
    metaTitle: 'Business Insights',
    metaDescription:
      'Practical business strategies, startup advice, and industry analysis.',
  },
  {
    categoryName: 'Design',
    slug: 'design',
    sortOrder: 3,
    excerpt:
      'Guides on UI/UX design, design systems, and user experience best practices.',
    metaTitle: 'Design & UX',
    metaDescription:
      'Guides on UI/UX design, design systems, and user experience best practices.',
  },
  {
    categoryName: 'Marketing',
    slug: 'marketing',
    sortOrder: 4,
    excerpt:
      'Modern marketing techniques, growth hacking, and content strategy that drives results.',
    metaTitle: 'Marketing Strategies',
    metaDescription:
      'Modern marketing techniques, growth hacking, and content strategy.',
  },
  {
    categoryName: 'Development',
    slug: 'development',
    sortOrder: 5,
    excerpt:
      'Tutorials, patterns, and deep dives into software engineering for all skill levels.',
    metaTitle: 'Software Development',
    metaDescription:
      'Tutorials, patterns, and deep dives into software engineering.',
  },
  {
    categoryName: 'Productivity',
    slug: 'productivity',
    sortOrder: 6,
    excerpt:
      'Workflows, tools, and habits to help developers and teams work smarter every day.',
    metaTitle: 'Productivity Tips',
    metaDescription:
      'Workflows, tools, and habits to help developers work smarter.',
  },
  {
    categoryName: 'Security',
    slug: 'security',
    sortOrder: 7,
    excerpt:
      'Application security, vulnerability research, and secure development practices.',
    metaTitle: 'Cybersecurity',
    metaDescription:
      'Application security, vulnerability research, and secure development.',
  },
  {
    categoryName: 'Cloud',
    slug: 'cloud',
    sortOrder: 8,
    excerpt:
      'Cloud architecture, managed services, and infrastructure-as-code at scale.',
    metaTitle: 'Cloud Computing',
    metaDescription:
      'Cloud architecture, managed services, and infrastructure-as-code.',
  },
  {
    categoryName: 'AI & ML',
    slug: 'ai-ml',
    sortOrder: 9,
    excerpt:
      'Machine learning, deep learning, and practical AI engineering for real-world applications.',
    metaTitle: 'Artificial Intelligence & ML',
    metaDescription:
      'Machine learning, deep learning, and practical AI engineering.',
  },
  {
    categoryName: 'Open Source',
    slug: 'open-source',
    sortOrder: 10,
    excerpt:
      'Open source projects, contributions, and community building in the software ecosystem.',
    metaTitle: 'Open Source Software',
    metaDescription:
      'Open source projects, contributions, and community building.',
  },
  {
    categoryName: 'Mobile',
    slug: 'mobile',
    sortOrder: 11,
    excerpt:
      'iOS, Android, and cross-platform mobile app development guides and best practices.',
    metaTitle: 'Mobile Development',
    metaDescription: 'iOS, Android, and cross-platform mobile app development.',
  },
  {
    categoryName: 'Web Development',
    slug: 'web-development',
    sortOrder: 12,
    excerpt:
      'Frontend and backend web development techniques, tools, and modern frameworks.',
    metaTitle: 'Web Development',
    metaDescription:
      'Frontend and backend web development techniques and tools.',
  },
  {
    categoryName: 'Infrastructure',
    slug: 'infrastructure',
    sortOrder: 13,
    excerpt:
      'Servers, networking, Kubernetes, and platform reliability for engineering teams.',
    metaTitle: 'Infrastructure Engineering',
    metaDescription:
      'Servers, networking, Kubernetes, and platform reliability.',
  },
  {
    categoryName: 'Data Science',
    slug: 'data-science',
    sortOrder: 14,
    excerpt:
      'Data analysis, visualisation, and data-driven decision making for modern organisations.',
    metaTitle: 'Data Science',
    metaDescription:
      'Data analysis, visualisation, and data-driven decision making.',
  },
  {
    categoryName: 'Engineering Culture',
    slug: 'engineering-culture',
    sortOrder: 15,
    excerpt:
      'Team practices, code review culture, technical leadership, and engineering career growth.',
    metaTitle: 'Engineering Culture',
    metaDescription:
      'Team practices, code review culture, technical leadership, and career growth.',
  },
];

const TAGS = [
  {
    name: 'JavaScript',
    slug: 'javascript',
    sortOrder: 1,
    excerpt:
      'Articles covering JavaScript fundamentals, modern APIs, and ecosystem tooling.',
  },
  {
    name: 'TypeScript',
    slug: 'typescript',
    sortOrder: 2,
    excerpt:
      'TypeScript guides covering types, generics, and large-scale application patterns.',
  },
  {
    name: 'React',
    slug: 'react',
    sortOrder: 3,
    excerpt:
      'React tutorials on hooks, state management, performance, and component architecture.',
  },
  {
    name: 'Node.js',
    slug: 'nodejs',
    sortOrder: 4,
    excerpt:
      'Node.js content covering servers, streams, async patterns, and backend services.',
  },
  {
    name: 'Python',
    slug: 'python',
    sortOrder: 5,
    excerpt:
      'Python articles on scripting, data science, automation, and web backends.',
  },
  {
    name: 'DevOps',
    slug: 'devops',
    sortOrder: 6,
    excerpt:
      'DevOps practices including CI/CD, infrastructure automation, and deployment workflows.',
  },
  {
    name: 'Docker',
    slug: 'docker',
    sortOrder: 7,
    excerpt:
      'Docker guides on containerisation, image optimisation, and multi-service setups.',
  },
  {
    name: 'Kubernetes',
    slug: 'kubernetes',
    sortOrder: 8,
    excerpt:
      'Kubernetes content on orchestration, deployments, scaling, and cluster management.',
  },
  {
    name: 'AWS',
    slug: 'aws',
    sortOrder: 9,
    excerpt:
      'AWS tutorials covering compute, storage, serverless, and cloud-native patterns.',
  },
  {
    name: 'Git',
    slug: 'git',
    sortOrder: 10,
    excerpt:
      'Git workflows, branching strategies, and version control best practices.',
  },
  {
    name: 'Testing',
    slug: 'testing',
    sortOrder: 11,
    excerpt:
      'Software testing guides covering unit, integration, and end-to-end testing strategies.',
  },
  {
    name: 'Performance',
    slug: 'performance',
    sortOrder: 12,
    excerpt:
      'Performance optimisation techniques for frontend, backend, and database layers.',
  },
  {
    name: 'API',
    slug: 'api',
    sortOrder: 13,
    excerpt:
      'API design, REST principles, versioning, and developer experience best practices.',
  },
  {
    name: 'Database',
    slug: 'database',
    sortOrder: 14,
    excerpt:
      'Database design, query optimisation, migrations, and schema management guides.',
  },
  {
    name: 'CSS',
    slug: 'css',
    sortOrder: 15,
    excerpt:
      'CSS layout, animations, design tokens, and modern styling techniques.',
  },
  {
    name: 'UX',
    slug: 'ux',
    sortOrder: 16,
    excerpt:
      'User experience research, usability testing, and design decision frameworks.',
  },
  {
    name: 'Agile',
    slug: 'agile',
    sortOrder: 17,
    excerpt:
      'Agile methodologies, sprint planning, retrospectives, and team delivery practices.',
  },
  {
    name: 'Startup',
    slug: 'startup',
    sortOrder: 18,
    excerpt:
      'Startup advice on MVPs, fundraising, product-market fit, and early growth.',
  },
  {
    name: 'Career',
    slug: 'career',
    sortOrder: 19,
    excerpt:
      'Career development guides for engineers on levelling up, interviews, and leadership.',
  },
  {
    name: 'Open Source',
    slug: 'opensource',
    sortOrder: 20,
    excerpt:
      'Open source contribution guides, licensing, and community engagement strategies.',
  },
  {
    name: 'Next.js',
    slug: 'nextjs',
    sortOrder: 21,
    excerpt:
      'Next.js tutorials on the App Router, RSC, ISR, and full-stack React patterns.',
  },
  {
    name: 'GraphQL',
    slug: 'graphql',
    sortOrder: 22,
    excerpt:
      'GraphQL schema design, resolvers, federation, and client-side data fetching.',
  },
  {
    name: 'Microservices',
    slug: 'microservices',
    sortOrder: 23,
    excerpt:
      'Microservices architecture, service communication, and distributed systems patterns.',
  },
  {
    name: 'CI/CD',
    slug: 'cicd',
    sortOrder: 24,
    excerpt:
      'CI/CD pipeline design, automated testing, and continuous deployment workflows.',
  },
  {
    name: 'Linux',
    slug: 'linux',
    sortOrder: 25,
    excerpt:
      'Linux fundamentals, shell scripting, system administration, and server management.',
  },
  {
    name: 'Monitoring',
    slug: 'monitoring',
    sortOrder: 26,
    excerpt:
      'Observability, metrics, logging, and alerting for production systems.',
  },
  {
    name: 'Serverless',
    slug: 'serverless',
    sortOrder: 27,
    excerpt:
      'Serverless architecture, functions-as-a-service, and event-driven design patterns.',
  },
  {
    name: 'Mobile',
    slug: 'mobile',
    sortOrder: 28,
    excerpt:
      'Mobile development across iOS, Android, and cross-platform frameworks.',
  },
  {
    name: 'Architecture',
    slug: 'architecture',
    sortOrder: 29,
    excerpt:
      'Software architecture patterns, system design, and long-term technical decision making.',
  },
  {
    name: 'Best Practices',
    slug: 'best-practices',
    sortOrder: 30,
    excerpt:
      'Engineering best practices on code quality, reviews, documentation, and maintainability.',
  },
];

const TITLE_TEMPLATES = [
  'Getting Started with {topic}',
  'A Practical Guide to {topic}',
  'Advanced {topic} Patterns You Should Know',
  'The Complete {topic} Handbook',
  'Mastering {topic} in Production',
  'How to Build Scalable Systems with {topic}',
  'Understanding {topic} Under the Hood',
  'Common {topic} Mistakes and How to Avoid Them',
  '{topic} Best Practices for 2024',
  'Why {topic} Matters for Modern Teams',
  'From Zero to Hero with {topic}',
  'Deep Dive into {topic}',
  'Optimising Your {topic} Workflow',
  'The Future of {topic}',
  'Building Production-Ready {topic} Applications',
  '{topic} Tips Every Developer Should Know',
  'Securing Your {topic} Setup',
  'Testing Strategies for {topic}',
  'Automating {topic} Deployments',
  '{topic} for Beginners: A Step-by-Step Guide',
  'Scaling {topic} Beyond the Basics',
  'Real-World {topic} Case Studies',
  'The Hidden Costs of Ignoring {topic}',
  'How We Migrated to {topic} at Scale',
  '{topic} vs the Alternatives: A Fair Comparison',
  'Lessons Learned from {topic} in Production',
  'Five Ways to Improve Your {topic} Pipeline',
  'An Honest Review of {topic}',
  'Debugging {topic} Issues Like a Pro',
  '{topic} Architecture Decision Records',
  'Setting Up {topic} for a New Project',
  'Refactoring Toward Better {topic}',
  'Monitoring and Observability with {topic}',
  'The Minimal {topic} Setup That Actually Works',
  'Making {topic} Work for Small Teams',
  '{topic} Internals Explained',
  'Patterns That Make {topic} Shine',
  'Twelve-Factor {topic} Applications',
  'Onboarding Engineers to {topic}',
  'What Nobody Tells You About {topic}',
];

const TOPIC_WORDS = [
  'TypeScript',
  'React Hooks',
  'Node.js Streams',
  'Docker Containers',
  'Kubernetes Clusters',
  'AWS Lambda',
  'REST APIs',
  'GraphQL Schemas',
  'PostgreSQL Indexing',
  'Redis Caching',
  'CI/CD Pipelines',
  'Git Workflows',
  'Unit Testing',
  'Performance Optimisation',
  'CSS Grid Layouts',
  'UX Research',
  'Agile Sprints',
  'Startup MVPs',
  'Career Growth',
  'Open Source Contributions',
  'Machine Learning Models',
  'Cloud Architecture',
  'Security Audits',
  'Microservices',
  'WebSockets',
  'Server-Side Rendering',
  'Database Migrations',
  'Code Reviews',
  'Technical Debt',
  'Developer Productivity',
  'Next.js App Router',
  'Serverless Functions',
  'Linux Permissions',
  'Monitoring Dashboards',
  'Mobile Offline Sync',
  'API Rate Limiting',
  'Data Pipelines',
  'Platform Engineering',
  'Engineering Culture',
  'Observability',
];

const EXCERPT_TEMPLATES = [
  'Learn the fundamentals of {topic} and discover how they can transform your development workflow.',
  'Explore practical patterns for {topic} that experienced engineers rely on in real production systems.',
  '{topic} can be tricky — this guide breaks it down into clear, actionable steps you can apply today.',
  'This deep dive into {topic} covers everything from setup to advanced configuration and deployment.',
  'Whether you are just starting out or looking to sharpen your skills, this guide to {topic} has you covered.',
  'Discover how teams are leveraging {topic} to ship faster, reduce errors, and scale with confidence.',
  'A comprehensive look at {topic}, including common pitfalls, proven patterns, and real-world examples.',
  'We share what we have learned after running {topic} in production for over two years at scale.',
  'Get up to speed with {topic} quickly using this hands-on walkthrough packed with practical examples.',
  'Everything you need to know about {topic} to make informed architecture and tooling decisions.',
];

export async function runBlogSeed(db: ReturnType<typeof drizzle>) {
  console.log('🌱 Starting blog seed...');

  // 1. Resolve admin user
  const [adminUser] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, 'admin@admin.com'));

  if (!adminUser) {
    throw new Error(
      'Admin user not found. Run the base seed first: pnpm --filter backend seed',
    );
  }
  const adminId = adminUser.id;

  // 2. Seed authors
  console.log('  → Seeding blog authors...');
  await db
    .insert(blogAuthors)
    .values(
      AUTHORS.map((a) => ({ ...a, status: 'active', createdBy: adminId })),
    )
    .onConflictDoNothing();
  const allAuthors = await db.select({ id: blogAuthors.id }).from(blogAuthors);
  console.log(`     ${allAuthors.length} authors ready`);

  // 3. Seed categories
  console.log('  → Seeding blog categories...');
  await db
    .insert(blogCategories)
    .values(
      CATEGORIES.map((c) => ({
        ...c,
        status: 'published' as const,
        robots: 'index' as const,
        googlebot: 'index' as const,
        createdBy: adminId,
      })),
    )
    .onConflictDoNothing();
  const allCategories = await db
    .select({ id: blogCategories.id })
    .from(blogCategories);
  console.log(`     ${allCategories.length} categories ready`);

  // 4. Seed tags
  console.log('  → Seeding blog tags...');
  await db
    .insert(blogTags)
    .values(
      TAGS.map((t) => ({
        ...t,
        status: 'published' as const,
        createdBy: adminId,
      })),
    )
    .onConflictDoNothing();
  const allTags = await db.select({ id: blogTags.id }).from(blogTags);
  console.log(`     ${allTags.length} tags ready`);

  // 5. Generate and seed 200 blog posts
  console.log('  → Seeding blog posts...');
  const now = new Date();
  const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
  const PUBLISHED_COUNT = 140;
  const TOTAL = 200;
  const FEATURED_COUNT = 20;

  const postRows = Array.from({ length: TOTAL }, (_, i) => {
    const topicWord = TOPIC_WORDS[i % TOPIC_WORDS.length];
    const titleTmpl = TITLE_TEMPLATES[i % TITLE_TEMPLATES.length];
    const title = titleTmpl.replace('{topic}', topicWord);
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${i + 1}`;
    const isPublished = i < PUBLISHED_COUNT;
    const publishedAt = isPublished
      ? new Date(
          twoYearsAgo.getTime() +
            (i / PUBLISHED_COUNT) * (now.getTime() - twoYearsAgo.getTime()),
        )
      : null;

    return {
      title,
      slug,
      excerpt: EXCERPT_TEMPLATES[i % EXCERPT_TEMPLATES.length].replace(
        '{topic}',
        topicWord,
      ),
      content: `<h2>Introduction</h2><p>This comprehensive guide covers everything you need to know about ${topicWord}. Whether you're a beginner or an experienced engineer, you'll find actionable insights to improve your work.</p><h2>Why It Matters</h2><p>${topicWord} has become essential in modern software development. Teams that master it ship faster, experience fewer outages, and onboard new engineers more smoothly.</p><h2>Core Concepts</h2><p>Before diving into advanced patterns, it's important to understand the fundamentals. ${topicWord} is built on a set of principles that, once internalised, make everything else click into place.</p><h2>Practical Examples</h2><p>Let's walk through some real-world scenarios where ${topicWord} makes a measurable difference. Each example includes code snippets, architectural diagrams, and lessons from production deployments.</p><h2>Common Pitfalls</h2><p>Even experienced engineers make mistakes with ${topicWord}. Knowing what to watch out for can save you hours of debugging and prevent incidents in production.</p><h2>Conclusion</h2><p>Mastering ${topicWord} takes practice, but the payoff is significant. Start small, iterate, and don't be afraid to experiment in a safe environment.</p>`,
      authorId: allAuthors[i % allAuthors.length].id,
      status: isPublished ? ('published' as const) : ('draft' as const),
      publishedAt,
      isFeatured: i < FEATURED_COUNT,
      viewCount: isPublished ? (i % 10) * 150 : 0,
      likeCount: isPublished ? (i % 7) * 20 : 0,
      readingTime: 3 + (i % 13),
      metaTitle: title,
      metaDescription: `Learn about ${topicWord} in this comprehensive guide covering fundamentals, patterns, and real-world examples.`,
      metaKeywords: topicWord.toLowerCase().replace(/[^a-z0-9]+/g, ', '),
      robots: 'index' as const,
      googlebot: 'index' as const,
      createdBy: adminId,
    };
  });

  const insertedBlogs = await db
    .insert(blogs)
    .values(postRows)
    .onConflictDoNothing()
    .returning({ id: blogs.id });

  console.log(
    insertedBlogs.length === 0
      ? '     Blog posts already seeded — skipping relations'
      : `     ${insertedBlogs.length} blog posts inserted`,
  );

  if (insertedBlogs.length === 0) {
    console.log('✅ Blog seed complete (no new data)!');
    return;
  }

  // 6. Seed category relations (1–2 per post)
  console.log('  → Seeding category relations...');
  const categoryRelations: { blogId: string; categoryId: string }[] = [];
  for (let i = 0; i < insertedBlogs.length; i++) {
    const blogId = insertedBlogs[i].id;
    const primaryCatId = allCategories[i % allCategories.length].id;
    categoryRelations.push({ blogId, categoryId: primaryCatId });
    if (i % 2 === 0) {
      const secondaryCatId = allCategories[(i + 1) % allCategories.length].id;
      if (secondaryCatId !== primaryCatId) {
        categoryRelations.push({ blogId, categoryId: secondaryCatId });
      }
    }
  }
  await db
    .insert(blogCategoryRelations)
    .values(categoryRelations)
    .onConflictDoNothing();
  console.log(`     ${categoryRelations.length} category relations inserted`);

  // 7. Seed tag relations (2–4 per post, stride 11 is coprime with 30)
  console.log('  → Seeding tag relations...');
  const tagRelations: { blogId: string; tagId: string }[] = [];
  for (let i = 0; i < insertedBlogs.length; i++) {
    const blogId = insertedBlogs[i].id;
    const tagCount = 2 + (i % 3);
    const seenTags = new Set<string>();
    for (let t = 0; t < tagCount; t++) {
      const tagId = allTags[(i + t * 11) % allTags.length].id;
      if (!seenTags.has(tagId)) {
        seenTags.add(tagId);
        tagRelations.push({ blogId, tagId });
      }
    }
  }
  await db.insert(blogTagRelations).values(tagRelations).onConflictDoNothing();
  console.log(`     ${tagRelations.length} tag relations inserted`);

  console.log('✅ Blog seed complete!');
}

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME,
    ssl:
      process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  });
  const db = drizzle(pool);
  try {
    await runBlogSeed(db);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Blog seed failed:', err);
    process.exit(1);
  });
}
