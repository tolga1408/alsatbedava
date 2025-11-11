import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
// Import schema types - we'll use raw SQL instead
const LISTINGS_TABLE = 'listings';

// Realistic Turkish property listings data
const propertyData = [
  // Istanbul - Kadıköy
  {
    title: "Kadıköy Moda'da Deniz Manzaralı 3+1 Daire",
    description: "Kadıköy Moda semtinde, deniz manzaralı, yeni yapılmış lüks rezidansta 3+1 daire. Site içerisinde havuz, spor salonu ve güvenlik bulunmaktadır.",
    price: 4500000,
    categoryId: 1,
    city: "İstanbul",
    district: "Kadıköy",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ])
  },
  {
    title: "Kadıköy Merkez'de Satılık Dükkan",
    description: "Kadıköy'ün en işlek caddesinde, köşe başı konumda 85m² satılık dükkan. Kiracılı, yüksek kira getirisi.",
    price: 3200000,
    categoryId: 1,
    city: "İstanbul",
    district: "Kadıköy",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
    ])
  },
  // Istanbul - Beşiktaş
  {
    title: "Beşiktaş'ta Boğaz Manzaralı 4+1 Lüks Daire",
    description: "Beşiktaş'ın merkezinde, Boğaz manzaralı, 180m² geniş 4+1 daire. Asansörlü binada, otopark mevcut.",
    price: 8500000,
    categoryId: 1,
    city: "İstanbul",
    district: "Beşiktaş",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    ])
  },
  {
    title: "Beşiktaş'ta Yatırımlık 2+1 Daire",
    description: "Beşiktaş merkezde, yeni binada, kiracılı 2+1 daire. Metro ve denize yakın konum.",
    price: 3800000,
    categoryId: 1,
    city: "İstanbul",
    district: "Beşiktaş",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
    ])
  },
  // Istanbul - Sarıyer
  {
    title: "Sarıyer Zekeriyaköy'de Müstakil Villa",
    description: "Zekeriyaköy'de 500m² arsa içinde 350m² kullanım alanlı müstakil villa. Özel havuz, bahçe ve muhteşem orman manzarası.",
    price: 12000000,
    categoryId: 1,
    city: "İstanbul",
    district: "Sarıyer",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
    ])
  },
  // Istanbul - Şişli
  {
    title: "Şişli Mecidiyeköy'de Ofis Katı",
    description: "Mecidiyeköy merkezde, A+ plaza binasında 250m² ofis katı. Metro çıkışında, otopark dahil.",
    price: 6500000,
    categoryId: 1,
    city: "İstanbul",
    district: "Şişli",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    ])
  },
  {
    title: "Şişli'de Yeni Yapılmış 3+1 Daire",
    description: "Şişli'de sıfır binada, balkonlu, geniş 3+1 daire. Site içinde kapalı otopark ve güvenlik.",
    price: 5200000,
    categoryId: 1,
    city: "İstanbul",
    district: "Şişli",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"
    ])
  },
  // Ankara - Çankaya
  {
    title: "Çankaya Kavaklıdere'de Satılık 3+1 Daire",
    description: "Kavaklıdere'nin merkezinde, asansörlü binada 140m² 3+1 daire. Bakımlı, kullanışlı.",
    price: 3500000,
    categoryId: 1,
    city: "Ankara",
    district: "Çankaya",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"
    ])
  },
  {
    title: "Çankaya'da Yatırımlık 2+1 Daire",
    description: "Çankaya'da metro yakını, kiracılı 2+1 daire. Yüksek kira getirisi.",
    price: 2200000,
    categoryId: 1,
    city: "Ankara",
    district: "Çankaya",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
    ])
  },
  // Ankara - Keçiören
  {
    title: "Keçiören'de Satılık Arsa",
    description: "Keçiören'de imar içi 500m² arsa. Konut yapımına uygun, yola cepheli.",
    price: 1800000,
    categoryId: 1,
    city: "Ankara",
    district: "Keçiören",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
    ])
  },
  // Ankara - Etimesgut
  {
    title: "Etimesgut'ta Satılık Dükkan",
    description: "Etimesgut merkezde, işlek caddede 60m² satılık dükkan. Kiracılı.",
    price: 1500000,
    categoryId: 1,
    city: "Ankara",
    district: "Etimesgut",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
    ])
  },
  // İzmir - Konak
  {
    title: "Konak Alsancak'ta Deniz Manzaralı 3+1",
    description: "Alsancak'ın göbeğinde, deniz manzaralı, lüks 3+1 daire. Asansörlü, otoparklı.",
    price: 4200000,
    categoryId: 1,
    city: "İzmir",
    district: "Konak",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
    ])
  },
  {
    title: "Konak'ta Satılık Ofis",
    description: "Konak merkezde, plaza binasında 120m² ofis. Deniz manzaralı, kullanışlı.",
    price: 2800000,
    categoryId: 1,
    city: "İzmir",
    district: "Konak",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    ])
  },
  // İzmir - Karşıyaka
  {
    title: "Karşıyaka'da Satılık 4+1 Dubleks",
    description: "Karşıyaka'da site içinde, bahçe kullanımlı 4+1 dubleks. Havuz, spor salonu mevcut.",
    price: 5500000,
    categoryId: 1,
    city: "İzmir",
    district: "Karşıyaka",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
    ])
  },
  {
    title: "Karşıyaka'da Yatırımlık 2+1 Daire",
    description: "Karşıyaka merkezde, yeni binada 2+1 daire. Vapur iskelesine yakın.",
    price: 2600000,
    categoryId: 1,
    city: "İzmir",
    district: "Karşıyaka",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ])
  },
  // İzmir - Bornova
  {
    title: "Bornova'da Satılık 3+1 Daire",
    description: "Bornova'da site içinde, asansörlü, otoparklı 3+1 daire. Ege Üniversitesi yakını.",
    price: 3200000,
    categoryId: 1,
    city: "İzmir",
    district: "Bornova",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"
    ])
  },
  // İzmir - Çeşme
  {
    title: "Çeşme'de Denize Sıfır Villa",
    description: "Çeşme'de denize sıfır, özel plajlı, 400m² lüks villa. Muhteşem deniz manzarası.",
    price: 15000000,
    categoryId: 1,
    city: "İzmir",
    district: "Çeşme",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"
    ])
  },
  // İzmir - Urla
  {
    title: "Urla'da Bağ Evi ve Zeytinlik",
    description: "Urla'da 5000m² zeytinlik içinde taş bağ evi. Şarap rotası üzerinde, muhteşem manzara.",
    price: 6800000,
    categoryId: 1,
    city: "İzmir",
    district: "Urla",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
    ])
  },
  // Additional Istanbul listings
  {
    title: "Üsküdar'da Satılık 2+1 Daire",
    description: "Üsküdar merkezde, deniz manzaralı, yeni binada 2+1 daire. Marmaray yakını.",
    price: 3600000,
    categoryId: 1,
    city: "İstanbul",
    district: "Üsküdar",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
    ])
  },
  {
    title: "Bakırköy'de Satılık 3+1 Daire",
    description: "Bakırköy merkezde, metrobüs yakını, asansörlü binada 3+1 daire.",
    price: 4100000,
    categoryId: 1,
    city: "İstanbul",
    district: "Bakırköy",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"
    ])
  },
  {
    title: "Maltepe'de Satılık 2+1 Daire",
    description: "Maltepe sahil yolu üzerinde, deniz manzaralı 2+1 daire. Site içinde.",
    price: 2900000,
    categoryId: 1,
    city: "İstanbul",
    district: "Maltepe",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ])
  },
  // Additional Ankara listings
  {
    title: "Yenimahalle'de Satılık 3+1 Daire",
    description: "Yenimahalle'de yeni yapılmış sitede 3+1 daire. Kapalı otopark, güvenlik.",
    price: 2800000,
    categoryId: 1,
    city: "Ankara",
    district: "Yenimahalle",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"
    ])
  },
  {
    title: "Mamak'ta Satılık Arsa",
    description: "Mamak'ta imar içi 400m² arsa. Konut yapımına uygun.",
    price: 1200000,
    categoryId: 1,
    city: "Ankara",
    district: "Mamak",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
    ])
  },
  // Additional İzmir listings
  {
    title: "Bayraklı'da Satılık 3+1 Daire",
    description: "Bayraklı'da yeni rezidansta, deniz manzaralı 3+1 daire. Havuz, spor salonu.",
    price: 3800000,
    categoryId: 1,
    city: "İzmir",
    district: "Bayraklı",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
    ])
  },
  {
    title: "Gaziemir'de Satılık 2+1 Daire",
    description: "Gaziemir'de havaalanı yakını, yeni binada 2+1 daire. Yatırımlık.",
    price: 2400000,
    categoryId: 1,
    city: "İzmir",
    district: "Gaziemir",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
    ])
  },
  {
    title: "Narlıdere'de Deniz Manzaralı 4+1",
    description: "Narlıdere'de deniz manzaralı, lüks sitede 4+1 daire. Havuz, güvenlik.",
    price: 5800000,
    categoryId: 1,
    city: "İzmir",
    district: "Narlıdere",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    ])
  },
  // More variety
  {
    title: "Ataşehir'de Satılık Ofis",
    description: "Ataşehir'de A+ plaza binasında 180m² ofis. Metro çıkışında.",
    price: 4500000,
    categoryId: 1,
    city: "İstanbul",
    district: "Ataşehir",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    ])
  },
  {
    title: "Pendik'te Satılık Arsa",
    description: "Pendik'te imar içi 600m² arsa. Denize yakın konum.",
    price: 2100000,
    categoryId: 1,
    city: "İstanbul",
    district: "Pendik",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
    ])
  },
  {
    title: "Buca'da Satılık 3+1 Daire",
    description: "Buca'da site içinde, asansörlü 3+1 daire. Ege Üniversitesi yakını.",
    price: 2700000,
    categoryId: 1,
    city: "İzmir",
    district: "Buca",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"
    ])
  },
  {
    title: "Sincan'da Satılık Dükkan",
    description: "Sincan merkezde, işlek caddede 70m² satılık dükkan.",
    price: 1100000,
    categoryId: 1,
    city: "Ankara",
    district: "Sincan",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
    ])
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Get the owner user (first user in the system)
    const ownerResult = await connection.execute('SELECT id FROM users ORDER BY id ASC LIMIT 1');
    const ownerId = ownerResult[0]?.[0]?.id;

    if (!ownerId) {
      console.error('❌ No owner user found. Please log in first to create a user.');
      process.exit(1);
    }

    console.log(`✅ Found owner user with ID: ${ownerId}`);

    // Insert listings using raw SQL
    console.log(`📝 Inserting ${propertyData.length} listings...`);
    
    for (const property of propertyData) {
      await connection.execute(
        `INSERT INTO listings (title, description, price, categoryId, city, district, images, userId, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          property.title,
          property.description,
          property.price,
          property.categoryId,
          property.city,
          property.district,
          property.images,
          ownerId,
          'active'
        ]
      );
    }

    console.log(`✅ Successfully inserted ${propertyData.length} listings!`);
    console.log('🎉 Database seeding complete!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDatabase().catch(console.error);
