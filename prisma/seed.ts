/**
 * prisma/seed.ts — بيانات ابتدائية لـ NoteVaultPro
 * تشغيل: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 * أو بعد إضافة prisma.seed في package.json: npx prisma db seed
 */

import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 بدء تهيئة البيانات الابتدائية...')

  // ─── 1. Admin ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123456', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@notevaultpro.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@notevaultpro.com',
      passwordHash: adminHash,
      fullName: 'مدير النظام',
      bio: 'مدير منصة NoteVaultPro',
      avatarColor: '#dc2626',
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin: ${admin.email}`)

  // ─── 2. Demo users ────────────────────────────────────────────────────────────
  const userHash = await bcrypt.hash('User@123456', 10)

  const ahmed = await prisma.user.upsert({
    where: { email: 'ahmed@demo.com' },
    update: {},
    create: {
      username: 'ahmed_writer',
      email: 'ahmed@demo.com',
      passwordHash: userHash,
      fullName: 'أحمد الكاتب',
      bio: 'كاتب ومدوّن متخصص في التقنية والعلوم',
      avatarColor: '#6366f1',
      role: 'USER',
    },
  })

  const sara = await prisma.user.upsert({
    where: { email: 'sara@demo.com' },
    update: {},
    create: {
      username: 'sara_notes',
      email: 'sara@demo.com',
      passwordHash: userHash,
      fullName: 'سارة النوتس',
      bio: 'أحب الأدب والفلسفة وتدوين الأفكار',
      avatarColor: '#ec4899',
      role: 'USER',
    },
  })
  console.log(`✅ Demo users: ${ahmed.username}, ${sara.username}`)

  // ─── 3. Notes ─────────────────────────────────────────────────────────────────
  const notes = [
    {
      title: 'مقدمة في الذكاء الاصطناعي',
      content: `الذكاء الاصطناعي (AI) هو أحد أبرز مجالات علوم الحاسوب في العصر الحديث. يهدف إلى بناء أنظمة قادرة على محاكاة القدرات الإنسانية كالتعلم والتفكير وحل المشكلات.

## أنواع الذكاء الاصطناعي

### 1. الذكاء الاصطناعي الضيق (Narrow AI)
يُصمَّم لأداء مهمة محددة مثل التعرف على الصور أو ترجمة النصوص.

### 2. الذكاء الاصطناعي العام (General AI)
نظام افتراضي قادر على أداء أي مهمة فكرية يستطيع الإنسان أداءها.

### 3. الذكاء الاصطناعي الخارق (Super AI)
مفهوم نظري يتجاوز القدرات البشرية في جميع المجالات.

## تطبيقات عملية
- معالجة اللغة الطبيعية (NLP)
- رؤية الحاسوب
- الروبوتات الذكية
- الأنظمة التوصية`,
      category: 'TECHNOLOGY' as const,
      tags: JSON.stringify(['AI', 'تقنية', 'مستقبل']),
      coverColor: '#6366f1',
      visibility: 'PUBLIC' as const,
      isPublic: true,
      downloads: 42,
      authorId: ahmed.id,
    },
    {
      title: 'أسرار التعلم الفعّال',
      content: `التعلم الفعّال ليس مجرد قراءة الكتب، بل هو منهجية متكاملة تجمع بين الفهم والتطبيق والمراجعة.

## مبادئ التعلم الفعّال

### تقنية بومودورو
اعمل 25 دقيقة متواصلة ثم خذ استراحة 5 دقائق. كرر هذا 4 مرات ثم خذ استراحة طويلة.

### التعلم النشط
بدلاً من القراءة السلبية، اكتب ملاحظاتك بأسلوبك الخاص وعلّم ما تعلمته لشخص آخر.

### التكرار المتباعد
راجع المعلومات على فترات متزايدة: بعد يوم، أسبوع، شهر.

### خريطة الذهن
ارسم خرائط ذهنية تربط المفاهيم ببعضها لتعزيز الفهم العميق.`,
      category: 'GENERAL' as const,
      tags: JSON.stringify(['تعلم', 'إنتاجية', 'تطوير']),
      coverColor: '#22c55e',
      visibility: 'FOR_SALE' as const,
      price: 15.00,
      isPublic: true,
      downloads: 28,
      authorId: ahmed.id,
    },
    {
      title: 'تأملات في الفلسفة الرواقية',
      content: `الرواقية مدرسة فلسفية يونانية أسسها زينون الكيتيوني حوالي 300 ق.م. تقوم على مبدأ أن السعادة تكمن في الفضيلة والسيطرة على الذات.

## المبادئ الأساسية

### ثنائية السيطرة
ينقسم العالم إلى ما يخضع لسيطرتنا (أفكارنا وأفعالنا) وما لا يخضع لها (الأحداث الخارجية). الحكمة تكمن في التركيز على الأول وقبول الثاني.

### اللاتعلق العاطفي
لا يعني عدم الشعور، بل يعني عدم السماح للمشاعر بالتحكم في قراراتنا.

### الممارسة اليومية
- التأمل الصباحي: تخيّل ما قد يسوء اليوم وكيف ستتعامل معه
- المراجعة المسائية: ما الذي فعلته جيداً؟ ما الذي يمكن تحسينه؟`,
      category: 'PHILOSOPHY' as const,
      tags: JSON.stringify(['فلسفة', 'رواقية', 'حكمة']),
      coverColor: '#8b5cf6',
      visibility: 'PUBLIC' as const,
      isPublic: true,
      downloads: 67,
      authorId: sara.id,
    },
    {
      title: 'دليل Next.js 14 للمبتدئين',
      content: `Next.js 14 هو إطار عمل React يوفر Server Components وApp Router وميزات متقدمة للأداء.

## البنية الأساسية

\`\`\`
app/
├── layout.tsx      # Layout الجذري
├── page.tsx        # الصفحة الرئيسية
├── api/
│   └── route.ts   # API Routes
└── components/
\`\`\`

## Server vs Client Components

### Server Components (افتراضي)
- تُعرض على الخادم
- لا تحتاج JavaScript في المتصفح
- مثالية لجلب البيانات

### Client Components
- تستخدم \`'use client'\`
- تدعم التفاعل والـ hooks
- تُحمَّل في المتصفح

## App Router
يستخدم نظام مجلدات لتعريف المسارات مع دعم layouts متداخلة وloading states.`,
      category: 'TECHNOLOGY' as const,
      tags: JSON.stringify(['Next.js', 'React', 'ويب']),
      coverColor: '#3b82f6',
      visibility: 'FOR_SALE' as const,
      price: 25.00,
      isPublic: true,
      downloads: 89,
      authorId: ahmed.id,
    },
    {
      title: 'قصيدة في الكتابة',
      content: `الكتابة نافذة الروح
تفتح على عوالم لا تُرى
كلمة تُولد من صمت
وفكرة تحيا في سطر

اكتب حين تضيق الدنيا
اكتب حين تتسع الأحلام
فالكلمات وطن لا يُباع
وملجأ لا تهدمه الأيام

في كل حرف قصة
في كل سطر عمر
والكاتب يعيش مرتين
مرة يحيا ومرة يُذكر`,
      category: 'LITERATURE' as const,
      tags: JSON.stringify(['شعر', 'أدب', 'كتابة']),
      coverColor: '#f43f5e',
      visibility: 'PUBLIC' as const,
      isPublic: true,
      downloads: 34,
      authorId: sara.id,
    },
    {
      title: 'أساسيات قواعد البيانات',
      content: `قواعد البيانات هي العمود الفقري لأي تطبيق حديث. فهم أساسياتها ضروري لكل مطور.

## أنواع قواعد البيانات

### Relational (SQL)
- MySQL, PostgreSQL, SQLite
- تستخدم جداول وعلاقات
- مثالية للبيانات المنظمة

### NoSQL
- MongoDB, Redis, Cassandra
- مرونة في البنية
- مثالية للبيانات غير المنظمة

## مفاهيم أساسية

### ACID
- **Atomicity**: العملية تنجح كلها أو تفشل كلها
- **Consistency**: البيانات دائماً في حالة صحيحة
- **Isolation**: العمليات المتزامنة لا تتداخل
- **Durability**: البيانات المحفوظة لا تضيع

### Indexing
الفهارس تسرّع الاستعلامات لكنها تبطئ الكتابة. استخدمها على الحقول التي تبحث فيها كثيراً.`,
      category: 'TECHNOLOGY' as const,
      tags: JSON.stringify(['قواعد بيانات', 'SQL', 'برمجة']),
      coverColor: '#f97316',
      visibility: 'PUBLIC' as const,
      isPublic: true,
      downloads: 55,
      authorId: admin.id,
    },
  ]

  for (const noteData of notes) {
    await prisma.note.upsert({
      where: {
        id: `seed-${noteData.title.slice(0, 10).replace(/\s/g, '-')}`,
      },
      update: {},
      create: {
        id: `seed-${noteData.title.slice(0, 10).replace(/\s/g, '-')}`,
        ...noteData,
      },
    })
  }
  console.log(`✅ تم إنشاء ${notes.length} مذكرات`)

  // ─── 4. Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: ahmed.id, type: 'SUCCESS', message: 'مرحباً بك في NoteVaultPro! ابدأ بإنشاء مذكرتك الأولى.' },
      { userId: ahmed.id, type: 'INFO', message: 'تم نشر مذكرتك "مقدمة في الذكاء الاصطناعي" بنجاح.' },
      { userId: sara.id, type: 'SUCCESS', message: 'مرحباً بك في NoteVaultPro! ابدأ بإنشاء مذكرتك الأولى.' },
      { userId: admin.id, type: 'INFO', message: 'تم تفعيل حساب الأدمن بنجاح.' },
    ],
    skipDuplicates: true,
  })
  console.log('✅ تم إنشاء الإشعارات')

  console.log('\n🎉 اكتملت البيانات الابتدائية!\n')
  console.log('─────────────────────────────────')
  console.log('👤 Admin:')
  console.log('   Email:    admin@notevaultpro.com')
  console.log('   Password: Admin@123456')
  console.log('\n👤 Demo User 1:')
  console.log('   Email:    ahmed@demo.com')
  console.log('   Password: User@123456')
  console.log('\n👤 Demo User 2:')
  console.log('   Email:    sara@demo.com')
  console.log('   Password: User@123456')
  console.log('─────────────────────────────────\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
